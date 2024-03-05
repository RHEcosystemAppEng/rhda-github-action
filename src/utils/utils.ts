
export function getEnvVar(envName: string): string {
    const value = process.env[envName];
    if (value === undefined || value.length === 0) {
        throw new Error(`❌ ${envName} environment variable must be set`);
    }
    return value;
}