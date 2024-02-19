import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import './init';

import { createRoutePages, logRoutePages } from './utils/page';
import buildHtml from './utils/buildHtml';
import { dirExists } from './utils/file';

const buildFolder = 'build';

const buildPath = join(process.cwd(), buildFolder);

export default async () => {
    const routePages = createRoutePages();

    for (const [route, page] of Object.entries(routePages)) {
        const pageContent = await buildHtml(page, routePages);

        const pageDirPath = join(buildPath, route);

        // create the directory if it doesn't exist
        if (!dirExists(pageDirPath)) mkdirSync(pageDirPath, { recursive: true });

        // write the page to the correct build folder
        writeFileSync(join(buildPath, route, 'index.html'), pageContent);
    }

    logRoutePages(routePages);

    writeFileSync(join(buildPath, 'build-' + new Date().toISOString()), 'build complete!');
};
