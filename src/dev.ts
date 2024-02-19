import http from 'node:http';
import path from 'node:path';
import url from 'node:url';
import chalk from 'chalk';
import chokidar from 'chokidar';

import html500 from './utils/500.html';
import { fileReadBuffer } from './utils/file';
import buildHtml from './utils/buildHtml';
import { RoutePages, createRoutePages, logRoutePages } from './utils/page';

type DevResponse = {
    chunk: string | Buffer;
    statusCode: number;
    headers: Record<string, string>;
};

export default async () => {
    /**
     * parse the page content from the content directory and build the route pages
     */
    let routePages: RoutePages = {};

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
                    routePages['/404'] || {
                        title: '404 - Page not found',
                        content: '404 - not found :(',
                        relativePath: '/404',
                        route: '',
                    }
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
            chunk: addDevScript(html500.replace('<!-- message -->', error.message)),
            statusCode: 500,
            headers: { 'Content-Type': 'text/html' },
        };
    };

    routePages = createRoutePages();

    const watchDirectories = ['content', 'static', 'templates'];
    let lastRefresh = new Date().toISOString();

    // refresh page data when a file changes
    chokidar
        .watch(
            watchDirectories.map((watchDir) => path.resolve(watchDir)),
            { depth: 99, persistent: true }
        )
        .on('change', async (path) => {
            console.log(chalk.yellow('File changed: '), path);
            routePages = createRoutePages();
            lastRefresh = new Date().toISOString();
        });

    logRoutePages(routePages);

    const port = process.env.PORT || '8080';
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
                const staticFilePath = path.join('static', urlPath);
                const staticChunk = fileReadBuffer(staticFilePath);

                // static file exists for urlPath
                if (staticChunk) {
                    const contentType = getContentType(staticFilePath);
                    return {
                        chunk: staticChunk,
                        statusCode: 200,
                        headers: contentType ? { 'Content-Type': contentType } : {},
                    };
                }

                // check for page route
                const page = routePages[urlPath];

                // page route exists for url build it on the fly
                if (page) {
                    const chunk = await buildHtml(page, routePages);

                    return {
                        chunk: addDevScript(chunk),
                        statusCode: 200,
                        headers: { 'Content-Type': 'text/html' },
                    };
                }

                // no static file or page route found
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
