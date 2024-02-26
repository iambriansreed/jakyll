#!/usr/bin/env node
import chalk from 'chalk';
import { Command } from 'commander'; // add this line
import build from './build';
import dev from './dev';
import deploy from './deploy';
import start from './start';
import init from './install';

(async () => {
    //add the following line
    const program = new Command();

    console.log(chalk.whiteBright.bgGreenBright('\n  Jakyll.js  \n'));

    program
        .version('0.5.5')
        .option('-dev', 'Run the site in development mode with hot reloading')
        .option('-build', 'Build a static version of the site and run it in production mode')
        .option('-start', 'Run it in production mode')
        .option('-deploy', 'Deploys a static production version of the site to gh-pages')
        .option('-init', 'Initializes the project adding scripts and creating the folders required')
        .parse(process.argv);

    const options = program.opts();

    if (options.Dev) {
        process.env.mode = 'dev';
        await dev();
    }

    if (options.Build) {
        await build();
    }

    if (options.Deploy) {
        await deploy();
    }

    if (options.Start) {
        await start();
    }

    if (options.init) {
        await init();
    }
})();
