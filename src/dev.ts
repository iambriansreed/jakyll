import http from 'node:http';
import path from 'node:path';
import url from 'node:url';
import chalk from 'chalk';
import chokidar from 'chokidar';

import { fileReadBuffer } from './utils/file';
import buildHtml from './utils/buildHtml';
import { rootDir, validateExistingSite } from './utils/common';
import { Site, parseFiles } from './utils/parseFiles';
import html500 from './utils/500html';

/**
 * log the content created
 */
export const logContent = (contents: Site['pages']) => {
    Object.entries(contents.kinds).forEach(([kind, contents]) => {
        console.log(chalk.green('\n' + Object.keys(kind).length + ' ' + kind + ' generated: \n'));
        contents.sort((r1, r2) => (r1.url > r2.url ? 1 : -1)).forEach(({ url }) => console.log(url));
    });
};

validateExistingSite();

type DevResponse = {
    chunk: string | Buffer;
    statusCode: number;
    headers: Record<string, string>;
};

export default async () => {
    console.log(chalk.greenBright('Dev mode starting...'));

    /**
     * parse the page content from the content directory and build the page pages
     */
    let site = parseFiles();

    /**
     * get the content type based on the file extension
     */
    function getContentType(filePath: string) {
        const ext = path.parse(filePath).ext.substring(1);
        return {
            html: 'text/html',
            css: 'text/css',
            js: 'application/javascript',
            jgp: 'image/jpeg',
            png: 'image/png',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            gif: 'image/gif',
            json: 'application/json',
            xml: 'application/xml',
            ico: 'image/x-icon',
        }[ext];
    }

    /**
     * add dev script to html
     */
    function addDevScript(html: string): string {
        return html.replace(
            '</body>',
            `<script>
let lastServerRefresh = '';
const refreshInterval = setInterval(async () => {
    const { lastRefresh } = await (await fetch('/dev-refresh')).json();
    if (!lastServerRefresh) lastServerRefresh = lastRefresh;
    else if (lastRefresh !== lastServerRefresh) {
        clearInterval(refreshInterval);
        window.location.reload();
        console.log('refreshing...');
    }
}, 2000);</script></body>`
        );
    }

    /**
     * 404 page
     */
    const page404 = async (): Promise<DevResponse> => {
        return {
            chunk: addDevScript(
                await buildHtml(
                    site.pages.withUrl('/404') || {
                        content: '404 - not found :(',
                        relativePath: '/404',
                        url: '/404',
                        kind: 'page',
                        meta: {
                            title: '404 - Page not found',
                            layout: 'layout',
                        },
                    },
                    site.pages
                )
            ),
            statusCode: 404,
            headers: { 'Content-Type': 'text/html' },
        };
    };

    /**
     * 500 page
     */
    const page500 = async (error: Error): Promise<DevResponse> => {
        return {
            chunk: addDevScript(html500!.replace('<!-- message -->', error.stack || '')),
            statusCode: 500,
            headers: { 'Content-Type': 'text/html' },
        };
    };

    let lastRefresh = new Date().toISOString();

    // refresh when a file changes
    chokidar
        .watch(rootDir, {
            depth: 99,
            persistent: true,
            ignored: (path) => path.includes('node_modules') || path.startsWith('.'),
        })
        .on('change', async (path) => {
            console.log(chalk.yellow('File changed: '), path.replace(process.cwd(), ''));
            site = parseFiles();
            lastRefresh = new Date().toISOString();
            logContent(site.pages);
        });

    const port = process.env.PORT || '4000';
    const host = process.env.HOST || 'localhost';

    // Create a server
    http.createServer(async (request, response) => {
        const urlPath = url.parse(request.url!, true).pathname!;

        // tells the browser the last time the server was refreshed
        if (urlPath === '/dev-refresh') {
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ lastRefresh }));
            return;
        }

        const { chunk, statusCode, headers } = await (async (): Promise<DevResponse> => {
            try {
                // check for static files
                const staticFilePath = path.join(rootDir, urlPath);

                const staticChunk = site.static.includes(staticFilePath) && fileReadBuffer(staticFilePath);

                // static file exists for urlPath
                if (staticChunk) {
                    const contentType = getContentType(staticFilePath);

                    return {
                        chunk: staticChunk,
                        statusCode: 200,
                        headers: {
                            'Cache-Control': 'no-cache',
                            ...(contentType ? { 'Content-Type': contentType } : {}),
                        },
                    };
                }

                // check for content page
                const content = site.pages.withUrl(urlPath);

                // page page exists for url build it on the fly
                if (content) {
                    const chunk = await buildHtml(content, site.pages);

                    return {
                        chunk: addDevScript(chunk),
                        statusCode: 200,
                        headers: { 'Content-Type': 'text/html' },
                    };
                }

                console.log(chalk.red('404: '), urlPath);

                // no static file or page page found
                return page404();
            } catch (error) {
                // error occurred
                return page500(error as any);
            }
        })();
        response.writeHead(statusCode, headers);
        response.end(chunk);
    }).listen(port, () => {
        console.info(chalk.green(`\nDev site is running at http://${host}:${port}`));
    });
};
