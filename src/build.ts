import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import buildHtml from './utils/buildHtml';
import { dirExists } from './utils/file';
import chalk from 'chalk';
import { validateExistingSite } from './utils/common';
import { Site, parseFiles } from './utils/parseFiles';
import { execSync } from 'node:child_process';

validateExistingSite();

const buildPath = path.join(process.cwd(), 'build');

const filePathToDirs = (filePath: string) => filePath.substring(0, filePath.lastIndexOf('/'));

export default async () => {
    console.log(chalk.yellowBright('Building...'));

    // remove the build folder and create a new one and copy the files into it
    execSync('rm -rf build && mkdir build');

    const site: Site = parseFiles();

    site.static.forEach((filePath) => {
        const dest = filePath.replace(process.cwd(), buildPath);
        execSync(`mkdir -p ${filePathToDirs(dest)}`);
        execSync(`cp -r ${filePath} ${dest}`);
    });

    for (const content of site.pages.list) {
        const pageContent = await buildHtml(content, site.pages);

        const pagePath = path.join(buildPath, content.relativePath);

        const pageDirPath = filePathToDirs(pagePath);

        // create the directory if it doesn't exist
        if (!dirExists(pageDirPath)) mkdirSync(pageDirPath, { recursive: true });

        // write the page to the correct build folder
        writeFileSync(pagePath, pageContent);
    }

    // logRoutePages(routePages);

    writeFileSync(path.join(buildPath, 'build-' + new Date().toISOString()), 'build complete!');
};
