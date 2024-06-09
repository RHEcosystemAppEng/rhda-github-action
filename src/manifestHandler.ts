import * as ghCore from '@actions/core';
import path from 'path';
import { promises as fs } from 'fs';

import { Inputs } from './generated/inputs-outputs.js';
import {
    fileNameToEcosystemMappings,
    DEFAULT_MANIFEST_DIR,
} from './constants.js';

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
    const manifestDir = manifestDirInput || DEFAULT_MANIFEST_DIR;

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
        ghCore.info(
            `🔍 Looking for manifest in "${path.join(process.cwd(), manifestDir)}"...`,
        );

        manifestFilename = await autoDetectManifest(manifestDir);
    }

    const resolvedManifestPath = path.join(manifestDir, manifestFilename);
    ghCore.info(`ℹ️ Manifest file path is "${resolvedManifestPath}"`);

    return {
        manifestFilePath: resolvedManifestPath,
        ecosystem: fileNameToEcosystemMappings[manifestFilename],
    };
}

async function autoDetectManifest(manifestDir: string): Promise<string> {
    const manifestDirContents = await fs.readdir(manifestDir);

    for (const fileName of manifestDirContents) {
        if (fileName in fileNameToEcosystemMappings) {
            return fileName;
        }
    }

    throw new Error(getUnknownManifestError(manifestDir));
}

function getUnknownManifestError(manifestDir: string): string {
    return (
        `Failed to find a manifest file in "${manifestDir}" matching one of the expected project types. ` +
        `Expected to find one of: ${Object.keys(fileNameToEcosystemMappings).join(', ')}`
    );
}
