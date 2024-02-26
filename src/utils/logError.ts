import chalk from 'chalk';

/**
 * Log the error message and throw an Error
 */
export default function logError(errorMessage: string): void {
    console.error(
        chalk.red(`      
Build Error:
    ${errorMessage}
`)
    );

    if (process.env.mode === 'dev') throw new Error(errorMessage);
    else process.exit(1);
}
