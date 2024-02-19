#!/usr/bin/env node
import chalk from 'chalk';
import { Command } from 'commander'; // add this line
import { execSync } from 'node:child_process';
import buildBase from './build';
import dev from './dev';
import './init';

(async () => {
    //add the following line
    const program = new Command();

    console.log(chalk.whiteBright.bgGreenBright('\n  Jakyll.js  \n'));

    program
        .version('1.0.0')
        .description('An example CLI for managing a directory')
        .option('-dev', 'Run the site in development mode with hot reloading')
        .option('-build', 'Build a static version of the site and run it in production mode')
        .option('-start', 'Run it in production mode')
        .option('-deploy', 'Deploys a static production version of the site to gh-pages')
        .parse(process.argv);

    const options = program.opts();

    const build = async () => {
        console.log(chalk.yellowBright('Building...'));

        // remove the build folder and create a new one and copy the static folder into it
        execSync('rm -rf build && mkdir build && cp -R static/. build/');

        await buildBase();
    };

    if (options.Dev) {
        console.log(chalk.greenBright('Dev mode starting...'));
        await dev();
    }

    if (options.Build) {
        await build();
        console.log('');
    }

    if (options.Deploy) {
        await build();

        console.log(chalk.yellowBright('Deploying to gh-pages...'));

        const ghPages = require('gh-pages');
        (async () =>
            await ghPages.publish('build', { nojekyll: true }, function (err: any) {
                if (err) {
                    console.log(chalk.red('Error deploying to gh-pages: '), err);
                }
            }))();

        console.log(chalk.greenBright('Deployment complete!'));
    }

    if (options.Start) {
        await build();

        const port = process.env.PORT || '8080';
        const host = process.env.HOST || 'localhost';
        console.info(chalk.green(`\nProduction site is running at http://${host}:${port}`));

        execSync('npx http-server build -o');
    }
})();
