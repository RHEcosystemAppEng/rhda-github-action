import * as fs from 'fs';
import * as zlib from "zlib";

export function getEnvVar(envName: string): string {
    const value = process.env[envName];
    if (value === undefined || value.length === 0) {
        throw new Error(`❌ ${envName} environment variable must be set`);
    }
    return value;
}

export function writeToFile(data, path) {
    try {
        fs.writeFileSync(path, data, "utf-8");
    } catch (err) {
        throw (err);
    }
}

export function escapeWindowsPathForActionsOutput(p: string): string {
    return p.replace(/\\/g, "\\\\");
}

/**
 *
 * @returns The given file as a gzipped string.
 */
export async function zipFile(file: string): Promise<string> {
    const fileContents = await fs.readFileSync(file, "utf-8");
    // ghCore.debug(`Raw upload size: ${utils.convertToHumanFileSize(fileContents.length)}`);
    const zippedContents = (await zlib.gzipSync(fileContents)).toString("base64");
    // ghCore.debug(`Zipped file: ${zippedContents}`);
    // ghCore.info(`Zipped upload size: ${utils.convertToHumanFileSize(zippedContents.length)}`);

    return zippedContents;
}


/**
 * Checks if the specified keys are defined within the provided object.
 * @param obj - The object to check for key definitions.
 * @param keys - The keys to check for within the object.
 * @returns A boolean indicating whether all specified keys are defined within the object.
 */
export function isDefined(obj: any, ...keys: string[]): boolean {
  for (const key of keys) {
      if (!obj || !obj[key]) {
          return false;
      }
      obj = obj[key];
  }
  return true;
}
