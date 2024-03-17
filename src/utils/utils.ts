import * as path from 'path';
import * as fs from 'fs';

export function getEnvVar(envName: string): string {
    const value = process.env[envName];
    if (value === undefined || value.length === 0) {
        throw new Error(`❌ ${envName} environment variable must be set`);
    }
    return value;
}

export function writeReportToFile(data, path) {
    try {
        fs.writeFileSync(path, data);
    } catch (err) {
        throw (err);
    }
}