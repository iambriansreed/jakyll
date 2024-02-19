import chalk from 'chalk';

/**
 * Log the error message and throw an Error
 */
export default function error(errorMessage: string): void {
    console.error(
        chalk.red(`      
Build Error:
    ${errorMessage}
`)
    );

    throw new Error(errorMessage);
}
