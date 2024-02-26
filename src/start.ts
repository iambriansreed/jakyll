import { execSync } from 'node:child_process';
import chalk from 'chalk';
import build from './build';

export default async () => {
    await build();

    const port = process.env.PORT || '4000';
    const host = process.env.HOST || 'localhost';
    console.info(chalk.green(`\nProduction site is running at http://${host}:${port}`));

    execSync('npx http-server build -o');
};
