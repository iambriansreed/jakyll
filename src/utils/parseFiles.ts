import fs from 'node:fs';
import path from 'node:path';
import marked from 'marked';
import logError from './logError';
import fileRead, { fileExists } from './file';
import { rootDir } from './common';

export type Page = {
    url: string;
    content: string;
    relativePath: string;
    scopeGenerator?: string;
    kind: 'page' | string;
    meta: Record<string, any>;
};

export function getMetaFromBody(body: string) {
    return body.match(RegExp('---.*?---', 's'))?.[0];
}

class Pages {
    private pages: Page[] = [];

    withUrl = (urlPath: string) => {
        return this.pages.find(({ url }) => {
            if (url === urlPath) return true;
            if (urlPath === '/' && url === '/index.html') return true;
            return false;
        });
    };

    add = (page: Page) => {
        this.pages.push(page);
    };

    get kinds(): Record<string, Page[]> {
        const kinds: Record<string, Page[]> = {};

        this.pages.forEach((page) => {
            if (!kinds[page.kind]) kinds[page.kind] = [];
            kinds[page.kind].push({ ...page.meta, ...page });
        });

        return kinds;
    }

    get list(): Page[] {
        return this.pages;
    }

    sort = () => {
        this.pages.sort((a, b) => ((a.meta.date || '') > (b.meta.date || '') ? -1 : 1));
    };
}

export type Site = {
    layouts: string[];
    static: string[];
    pages: Pages;
};

const IGNORE_PATHS = {
    // ignore paths that end with these suffixes
    suffixes: ['package.json', 'package-lock.json', 'yarn.lock', '.lock', '.yml', 'README.md'],
    // ignore paths that start with these prefixes
    prefixes: ['.'],
    // ignore paths that contain these strings
    includes: ['_layouts', '_includes', 'node_modules'],
};

/**
 * parse the meta data from the content file
 */
export function parseMetaContent(
    content: string,
    relativePath: string
): [meta: Page['meta'], content: Page['content']] {
    const next: Pick<Page, 'meta' | 'content'> = {
        meta: {},
        content,
    };

    // get the meta data from the file
    const metaMatch = getMetaFromBody(content);
    // if the file has meta data, parse it
    if (metaMatch) {
        // remove meta from content
        next.content = next.content.replace(metaMatch, '').trim();

        // set the parsed the meta data
        for (const line of metaMatch.split('\n')) {
            if (line === '---') continue;
            if (!line.includes(':')) {
                logError(`Invalid meta on content page '${relativePath}'.`);
            }
            let [key, value] = line.split(/:(.*)/s, 2).map((k) => k.trim());

            ['"', "'"].forEach((quote) => {
                if (value.startsWith(quote) && value.endsWith(quote)) {
                    value = value.substring(1, value.length - 1);
                }
            });

            next.meta[key] = value;
        }
    }

    return [next.meta, next.content];
}

/**
 * create a Page object from the file path
 */
export function pageFromPath(pagePath: string): Page {
    const relativePath = pagePath.replace(rootDir, '');

    const newPage: Page = {
        kind: 'page',
        url: '/' + relativePath,
        scopeGenerator: undefined,
        content: '',
        relativePath,
        meta: {},
    };

    const kindMatch = relativePath.match(/^_([^/|.]+)\//);
    // if the filePath contains a content kind, set the kind to the content kind
    if (kindMatch) {
        newPage.kind = kindMatch[1];
        newPage.url = newPage.url.replace(`/${kindMatch[0]}`, `/${newPage.kind}/`);
    }

    const scopeGeneratorPaths = [
        pagePath.substring(0, pagePath.lastIndexOf('.')) + '.js',
        pagePath.substring(0, pagePath.lastIndexOf('.')) + '.cjs',
    ];
    for (const scopeGeneratorPath of scopeGeneratorPaths) {
        if (fileExists(scopeGeneratorPath)) {
            // we will run this when we build the page
            newPage.scopeGenerator = scopeGeneratorPath;
            break;
        }
    }

    // get the raw content
    newPage.content = fileRead(pagePath) || 'none';

    const [meta, content] = parseMetaContent(newPage.content, relativePath);
    newPage.content = content;
    newPage.meta = meta;

    // if the file is a markdown file, parse it to html and set the url to the html file
    if (relativePath.endsWith('.md')) {
        newPage.content = marked.parse(newPage.content.replace(/<br>/g, '<br>\n'));
        newPage.url = newPage.url.replace(/.md$/, '.html');
    }

    if (!newPage.meta.date) {
        // get date from the file name
        const match = path.basename(relativePath).match(/^(\d{4}-\d{1,2}-\d{1,2})-/);
        if (match) {
            const timestamp = new Date(match?.[1]);
            if (!isNaN(Number(timestamp))) newPage.meta.date = timestamp.toISOString();
        }
    }

    return newPage;
}

/**
 * Checks if the file is a content file (html or md)
 */
const isContent = (filePath: string) => filePath.match(/\.(html|md)$/g);

/**
 * Checks if the file should be ignored
 */
const ignoreFile = (filePath: string) =>
    IGNORE_PATHS.suffixes.some((suffix) => filePath.endsWith(suffix)) ||
    IGNORE_PATHS.prefixes.some((prefix) => filePath.startsWith(prefix)) ||
    IGNORE_PATHS.includes.some((dir) => filePath.includes(dir));

export function parseFiles(dir = process.cwd()): Site {
    const site: Site = {
        layouts: [],
        static: [],
        pages: new Pages(),
    };

    site.layouts.push(...fs.readdirSync(dir + '/_layouts', { recursive: true, encoding: 'utf-8' }));

    // handle root level directory entries
    const rootDirEntries =
        fs
            .readdirSync(dir, { withFileTypes: true })
            //
            .filter((dirEntry) => !ignoreFile(dirEntry.name)) || [];

    const allFiles: string[] = rootDirEntries
        .map((dirEntry) => {
            const dirEntryPath = path.join(dirEntry.path, dirEntry.name);

            if (dirEntry.isDirectory()) {
                return fs
                    .readdirSync(dirEntryPath, { recursive: true, encoding: 'utf-8' })
                    .filter((f) => !ignoreFile(f))
                    .map((filePath) => path.join(dirEntryPath, filePath));
            }
            return dirEntryPath;
        })
        .flat();

    // handle all files
    for (const filePath of allFiles) {
        // if the file is a content file, add it to the site.pages
        if (isContent(filePath)) {
            const page = pageFromPath(filePath);

            if (!page) continue;

            site.pages.add(page);
            continue;
        }

        // if the file is not a content file, add it to the site.static
        site.static.push(filePath);
    }

    site.pages.sort();

    return site;
}
