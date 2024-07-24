import * as ghCore from '@actions/core';
import path from 'path';
import { promises as fs } from 'fs';

import { Inputs } from './generated/inputs-outputs.js';
import { fileNameToEcosystemMappings } from './constants.js';

/**
 * Resolves the manifest file path and its corresponding ecosystem.
 * @returns A promise that resolves to an object containing the manifest file path and ecosystem.
 * @throws If the specified manifest file is not supported.
 */
export async function resolveManifestFilePath(): Promise<{
    manifestFilePath: string;
    ecosystem: string;
}> {
    const manifestDirInput = ghCore.getInput(Inputs.MANIFEST_DIRECTORY);
    const manifestFileInput = ghCore.getInput(Inputs.MANIFEST_FILE);

    if (!manifestDirInput) {
        ghCore.info(
            `"${Inputs.MANIFEST_DIRECTORY}" not provided. Using working directory "${process.cwd()}"`,
        );
    }
    const manifestDir = manifestDirInput
        ? path.resolve(manifestDirInput)
        : process.cwd();

    let manifestFilename: string;
    if (manifestFileInput) {
        manifestFilename = manifestFileInput;

        if (!(manifestFilename in fileNameToEcosystemMappings)) {
            throw new Error(`File "${manifestFilename}" is not supported!!`);
        }
    } else {
        ghCore.info(
            `"${Inputs.MANIFEST_FILE}" input not provided. Auto-detecting manifest file`,
        );
        ghCore.info(`🔍 Looking for manifest in "${manifestDir}"...`);

        manifestFilename = await autoDetectManifest(manifestDir);
    }

    const resolvedManifestPath = path.join(manifestDir, manifestFilename);
    ghCore.info(`ℹ️ Manifest file path is "${resolvedManifestPath}"`);

    return {
        manifestFilePath: resolvedManifestPath,
        ecosystem: fileNameToEcosystemMappings[manifestFilename],
    };
}

/**
 * Auto-detects the manifest file in the specified directory.
 * @param manifestDir - The directory to search for the manifest file.
 * @returns A promise that resolves to the name of the detected manifest file.
 * @throws If no supported manifest file is found in the directory.
 */
async function autoDetectManifest(manifestDir: string): Promise<string> {
    const manifestDirContents = await fs.readdir(manifestDir);

    for (const fileName of manifestDirContents) {
        if (fileName in fileNameToEcosystemMappings) {
            return fileName;
        }
    }

    throw new Error(getUnknownManifestError(manifestDir));
}

/**
 * Generates an error message when no supported manifest file is found.
 * @param manifestDir - The directory where the manifest file was expected.
 * @returns The error message.
 */
function getUnknownManifestError(manifestDir: string): string {
    return (
        `Failed to find a manifest file in "${manifestDir}" matching one of the expected project types. ` +
        `Expected to find one of: ${Object.keys(fileNameToEcosystemMappings).join(', ')}`
    );
}
