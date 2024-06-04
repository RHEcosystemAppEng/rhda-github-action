import * as ghCore from "@actions/core";
import path from "path";
import { promises as fs } from "fs";

import { Inputs } from "./generated/inputs-outputs.js";
import { fileNameToEcosystemMappings, DEFAULT_MANIFEST_DIR } from "./constants.js";

export async function resolveManifestFilePath (): Promise<{manifestFilePath: string, ecosystem: string}> {
    const manifestFilePathInput = ghCore.getInput(Inputs.MANIFEST_FILE_PATH);

    if (manifestFilePathInput) {
        const manifestFileName = path.basename(manifestFilePathInput);
        if (!(manifestFileName in fileNameToEcosystemMappings)) {
            throw new Error(`File ${manifestFileName} is not supported!!`);
        }

        ghCore.info(`ℹ️ "${Inputs.MANIFEST_FILE_PATH}" is "${manifestFilePathInput}"`);
        return {manifestFilePath: manifestFilePathInput, ecosystem: fileNameToEcosystemMappings[manifestFileName]};
    }

    ghCore.info(`"${Inputs.MANIFEST_FILE_PATH}" was not provided. Auto-detecting manifest file in working directory "${process.cwd()}"`);
    ghCore.info(`🔍 Looking for manifest file in "${process.cwd()}"...`);

    const detectedManifestFileName = await autoDetectManifest(DEFAULT_MANIFEST_DIR);

    const detectedManifestFilePath = path.join(DEFAULT_MANIFEST_DIR, detectedManifestFileName);
    
    ghCore.info(`ℹ️ Manifest file path is ${detectedManifestFilePath}`);

    return {manifestFilePath: detectedManifestFilePath, ecosystem: fileNameToEcosystemMappings[detectedManifestFileName]};
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
    return `Failed to find a manifest file in ${manifestDir} matching one of the expected project types. `
        + `Expected to find one of: ${Object.keys(fileNameToEcosystemMappings).join(", ")}`;
}