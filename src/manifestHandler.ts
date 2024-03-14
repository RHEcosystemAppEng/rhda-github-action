import * as ghCore from "@actions/core";
import path from "path";
import { promises as fs } from "fs";

import { Inputs } from "./generated/inputs-outputs.js";

const DEFAULT_MANIFEST_DIR = ".";
const SUPPORTED_FILES = [
    'pom.xml',
    'package.json',
    'go.mod',
    'requirements.txt'
  ];
  

export async function resolveManifestFilePath (): Promise<string> {
    const manifestFilePathInput = ghCore.getInput(Inputs.MANIFEST_FILE_PATH);

    if (manifestFilePathInput) {
        const manifestFilename = path.basename(manifestFilePathInput);
        if (!validateManifestTypeForFile(manifestFilename)) {
            throw new Error(`File ${manifestFilename} is not supported!!`);
        }

        ghCore.info(`"${Inputs.MANIFEST_FILE_PATH}" is "${manifestFilePathInput}"`);
        return manifestFilePathInput;
    }

    ghCore.info(`"${Inputs.MANIFEST_FILE_PATH}" was not provided. Auto-detecting manifest file in working directory "${process.cwd()}"`);
    ghCore.info(`🔍 Looking for manifest file in "${path.resolve(DEFAULT_MANIFEST_DIR)}"`);

    const manifestFilename = await autoDetectManifest(DEFAULT_MANIFEST_DIR);

    const manifestFilePath = path.join(DEFAULT_MANIFEST_DIR, manifestFilename);
    
    ghCore.info(`Manifest file path is ${manifestFilePath}`);

    return manifestFilePath;
}

async function autoDetectManifest(manifestDir: string): Promise<string> {
    const manifestDirContents = await fs.readdir(manifestDir);

    for (const filename of manifestDirContents) {
        if (validateManifestTypeForFile(filename)) {
            return filename;
        }
    }

    throw new Error(getUnknownManifestError(manifestDir));
}

function validateManifestTypeForFile(fileName: string): boolean {
    return SUPPORTED_FILES.includes(fileName);
}

function getUnknownManifestError(manifestDir: string): string {
    return `Failed to find a manifest file in ${manifestDir} matching one of the expected project types. `
        + `Expected to find one of: ${SUPPORTED_FILES.join(", ")}`;
}