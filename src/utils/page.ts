import path from 'node:path';
import { readdirSync } from 'node:fs';
import marked from 'marked';
import error from './error';
import fileRead, { fileExists } from './file';
import chalk from 'chalk';

export type Page = {
    route: string;
    content: string;
    title: string;
    relativePath: string;
    meta?: Record<string, any>;
    expressionGenerator?: string;
    template?: string;
};

export type RoutePages = Record<string, Page>;

export const contentDir = path.resolve(process.cwd(), 'content');

/**
 * parse the meta data from the content file
 */
function parseMeta(metaMatch: RegExpMatchArray, relativePath: string): Record<string, any> {
    const meta: Record<string, any> = {};

    if (metaMatch) {
        for (const line of metaMatch[0].split('\n')) {
            if (line === '---') continue;

            if (!line.includes(':')) {
                error(`Invalid meta on content page '${relativePath}'.`);
            }

            const [key, value] = line.split(/:(.*)/s, 2).map((k) => k.trim());

            meta[key] = value;
        }
    }

    return meta;
}

/**
 * build the url route from the relative path from contents directory
 */
function getUrlRoute(relativePath: string) {
    return (
        relativePath
            // remove content root (just in case)
            .replace(contentDir, '')
            // remove file ext
            .replace(/\.[a-z]+$/, '')
            // remove index file names
            .replace(/index+$/, '')
            // remove trailing slash
            .replace(/\/$/, '') || '/'
    );
}

/**
 * create a Page object from the file path
 */
export function pageFromPath(relativePath: string): Page | null {
    if (!relativePath || !isContent(relativePath)) return null;

    const details: Page = {
        route: getUrlRoute(relativePath),
        content: '',
        title: '',
        meta: {},
        relativePath,
    };

    // get the raw content
    const pagePath = path.join(contentDir, relativePath);
    const pageFileContents = fileRead(pagePath) || '';

    const expressionGeneratorPaths = [
        pagePath.substring(0, pagePath.lastIndexOf('.')) + '.js',
        pagePath.substring(0, pagePath.lastIndexOf('.')) + '.cjs',
    ];

    for (const expressionGeneratorPath of expressionGeneratorPaths) {
        if (fileExists(expressionGeneratorPath)) {
            // we will run this when we build the page
            details.expressionGenerator = expressionGeneratorPath;
            break;
        }
    }

    // get the meta data via regex Match
    const metaMatch = pageFileContents.match(RegExp('---.*?---', 's'));

    let meta: Record<string, any> = {};
    let content = '';

    if (metaMatch) {
        // remove meta from content
        content = pageFileContents.replace(metaMatch[0], '').trim();
        // set the parsed the meta data
        meta = parseMeta(metaMatch, relativePath);
    } else {
        content = pageFileContents;
    }

    meta.route = details.route;

    if (relativePath.endsWith('.md')) {
        content = marked.parse(content.replace(/<br>/g, '<br>\n'));
    }

    if (relativePath.endsWith('.txt')) {
        content = content.replace(/\n/g, '<br>\n');
    }

    if (meta.template) details.template = meta.template;

    details.content = content;
    details.meta = meta;

    return details;
}

const isContent = (file: string) => file.match(/\.(html|md|txt)$/g);

/**
 * Parses the content directory and returns the parsed content.
 */
export function createRoutePages(): Record<string, Page> {
    if (!fileExists(path.join(contentDir, 'index.html'))) {
        error(`Root page at 'contents/index.html' does not exist`);
    }

    const allFiles = readdirSync(contentDir, { recursive: true, encoding: 'utf-8' }) || [];

    const entries: [string, Page][] = [];

    for (const filePath of allFiles) {
        const page = pageFromPath(filePath.replace(contentDir, ''));
        if (page) {
            entries.push([page.route, page]);
        }
    }

    return Object.fromEntries(entries);
}

/**
 * log the routes created
 */
export const logRoutePages = (routePages: RoutePages) => {
    console.log(chalk.green('\n' + Object.keys(routePages).length + ' Routes generated: \n'));
    Object.entries(routePages)
        .sort((r1, r2) => (r1[0] > r2[0] ? 1 : -1))
        .forEach(([route]) => console.log(route));
};
