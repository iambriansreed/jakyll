import { existsSync, readFileSync, lstatSync } from 'node:fs';

/**
 * check if a file exists at the given path and is a file
 */
export function fileExists(path: string) {
    return existsSync(path) && lstatSync(path).isFile();
}

/**
 * check if a directory exists at the given path
 */
export function dirExists(path: string) {
    return existsSync(path) && lstatSync(path).isDirectory();
}

/**
 * read a file that exists or return a string or null if it doesn't exist
 */
export default function fileRead(path: string): string | null {
    return (fileExists(path) && readFileSync(path, { encoding: 'utf-8' })) || null;
}

/**
 * read a file that exists or return a buffer or null if it doesn't exist
 */
export function fileReadBuffer(path: string): Buffer | null {
    return (fileExists(path) && readFileSync(path)) || null;
}
