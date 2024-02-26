/** used in both build and dev comm */
import logError from './logError';
import { fileExists } from './file';
import path from 'path';

export const rootDir = path.join(process.cwd(), '/');

export function validateExistingSite() {
    if (!fileExists(path.join(rootDir, 'index.html'))) {
        logError(`Root page 'index.html' does not exist`);
    }

    if (!fileExists(path.join(rootDir, '_layouts', 'layout.html'))) {
        logError(`Default layout at '_layouts/layout.html' does not exist`);
    }
}
