import path from 'node:path';
import logError from './logError';
import fileRead from './file';
import { Page, Site, parseMetaContent } from './parseFiles';
import { rootDir } from './common';
import { Liquid } from 'liquidjs';
const engine = new Liquid({
    partials: path.join(rootDir, '_includes'),
    jekyllInclude: true,
});

async function applyLayout(page: Page, site: Record<string, Page[]>) {
    const nextPage = { ...page };

    const layout = page.meta.layout || 'layout';
    const layoutPath = path.join(rootDir, '_layouts', layout + '.html');
    let layoutChunk = fileRead(layoutPath);

    if (!layoutChunk) {
        logError(
            `Invalid layout on content page: '${page.relativePath}'. ` +
                `layout file '${layoutPath}' does not exist.`
        );
        return '';
    }

    const [layoutMeta, layoutContent] = parseMetaContent(layoutChunk, layoutPath);

    // merge the layout meta with the page meta
    nextPage.meta = { ...nextPage.meta, ...layoutMeta };

    const scope = {
        content: page.content,
        page: { ...nextPage.meta, ...page }, // flatten meta with page
        site,
    };

    // run the layout content through the template engine
    nextPage.content = await engine.parseAndRender(layoutContent, scope);

    // if the layout has a layout, apply it
    if (nextPage.meta.layout !== page.meta.layout) return applyLayout(nextPage, site);

    return nextPage.content;
}

/**
 * apply the layout to the content
 */
export default async function buildHtml(page: Page, pages: Site['pages']): Promise<string> {
    let nextPage = { ...page };

    // if the page has an scopeGenerator, run it and add the result to the layout data
    if (page.scopeGenerator) {
        const { default: scopeGenerator } = await import(page.scopeGenerator!);

        // ok, fine, but is it a function?
        if (typeof scopeGenerator !== 'function')
            logError(`Invalid scopeGenerator on page: '${page.relativePath}'`);
        else {
            const generatedScope = await scopeGenerator(page, pages.list);
            nextPage.meta = { ...nextPage.meta, ...generatedScope };
        }
    }

    const site = pages.kinds;

    // run the content through the template engine
    nextPage.content = await engine.parseAndRender(nextPage.content, {
        content: nextPage.content,
        page: { ...nextPage.meta, ...nextPage },
        site,
    });

    return await applyLayout(nextPage, site);
}
