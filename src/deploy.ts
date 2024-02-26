import chalk from 'chalk';
import build from './build';

export default async () => {
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
};
