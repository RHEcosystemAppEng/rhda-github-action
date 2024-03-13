import * as ghCore from "@actions/core";
import path from "path";
import { promises as fs } from "fs";

import { Inputs } from "./generated/inputs-outputs.js";

type ManifestType = "Go" | "Maven" | "Node.js" | "Pip" | "custom";
const DEFAULT_MANIFEST_DIR = ".";
const GO_MOD = "go.mod";
const POM_XML = "pom.xml";
const PACKAGE_JSON = "package.json";
const REQUIREMENTS_TXT = "requirements.txt";
const ALL_MANIFESTS = [
    GO_MOD, POM_XML, PACKAGE_JSON, REQUIREMENTS_TXT,
];

/**
 * Represents a Manifest Data object.
 */
interface IManifestData {
    filePath: string;
    fileName: string;
    fileType: string;
}

/**
 * Implementation of IManifestData interface.
 */
class ManifestData implements IManifestData {
    constructor(
        public filePath: string, 
        public fileName: string,
        public fileType: string
    ) {}
}

export async function resolveManifestFilePath (manifestFilePathInput: string): Promise<ManifestData> {
    let manifestFilePath: string;
    let manifestFilename: string;
    let manifestFileType: ManifestType | undefined;

    if (manifestFilePathInput) {
        manifestFileType = getManifestTypeForFile(path.basename(manifestFilePathInput));
        return new ManifestData(manifestFilePathInput, path.basename(manifestFilePathInput), manifestFileType);
    }

    ghCore.info(`"${Inputs.MANIFEST_FILE_PATH}" was not provided. Auto-detecting manifest file in working directory "${process.cwd()}"`);
    ghCore.info(`🔍 Looking for manifest file in "${path.resolve(DEFAULT_MANIFEST_DIR)}"`);

    const autoDetectResult = await autoDetectManifest(DEFAULT_MANIFEST_DIR);

    manifestFilename = autoDetectResult.filename;
    manifestFileType = autoDetectResult.fileType;
    manifestFilePath = path.join(DEFAULT_MANIFEST_DIR, manifestFilename);
    ghCore.info(`Manifest file path is ${manifestFilePath}`);
    return new ManifestData(manifestFilePath, manifestFilename, manifestFileType);
}

async function autoDetectManifest(manifestDir: string): Promise<{ filename: string, fileType: ManifestType }> {
    const manifestDirContents = await fs.readdir(manifestDir);

    for (const filename of manifestDirContents) {
        const fileType = getManifestTypeForFile(filename);
        if (fileType) {
            return { filename, fileType };
        }
    }

    throw new Error(getUnknownManifestError(manifestDir));
}

function getManifestTypeForFile(file: string): ManifestType | undefined {
    if (file.includes(GO_MOD)) {
        return "Go";
    }
    else if (file.includes(POM_XML)) {
        return "Maven";
    }
    else if (file.includes(PACKAGE_JSON)) {
        return "Node.js";
    }
    else if (file.includes(REQUIREMENTS_TXT)) {
        return "Pip";
    }

    return undefined;
}

function getUnknownManifestError(manifestDir: string): string {
    return `Failed to find a manifest file in ${manifestDir} matching one of the expected project types. `
        + `Expected to find one of: ${ALL_MANIFESTS.map((s) => `"${s}"`).join(", ")}`;
}