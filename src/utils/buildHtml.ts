import path from 'node:path';
import handlebars from 'handlebars';
import error from './error';
import fileRead from './file';
import { Page, RoutePages } from './page';

export const templatesDir = path.resolve(process.cwd(), 'templates');

const defaultHandlebarsTemplate = handlebars.compile(fileRead(path.join(templatesDir, 'default.html')));

/**
 * apply the template to the content
 */
export default async function buildHtml(page: Page, routePages: RoutePages = {}): Promise<string> {
    let { template, ...meta } = page.meta || {};

    let templateData = { ...meta, content: page.content };

    // if the page has an expressionGenerator, run it and add the result to the template data
    if (page.expressionGenerator) {
        const { default: expressionGenerator } = await import(page.expressionGenerator);
        templateData = { ...templateData, ...expressionGenerator(page, routePages) };
    }

    // apply the meta data to the page content in case it has handlebar expressions
    templateData.content = handlebars.compile(page.content)(templateData);

    if (template && template !== 'default') {
        // apply the template to the page content
        // todo: should support hbs and other template file types
        const templatePath = path.join(templatesDir, template + '.html');

        const templateChunk = fileRead(templatePath);

        if (!templateChunk) {
            error(
                `Invalid template on content page: '${page.relativePath}'. ` +
                    `Template file '${template}' does not exist.`
            );

            return '';
        }

        const metaTemplate = handlebars.compile(templateChunk);

        templateData.content = metaTemplate(templateData);
    }

    return defaultHandlebarsTemplate(templateData);
}
