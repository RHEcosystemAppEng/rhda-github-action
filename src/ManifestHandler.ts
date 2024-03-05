import * as ghCore from "@actions/core";
import { promises as fs } from "fs";

import { Inputs } from "./generated/inputs-outputs";
import path from "path";

type DepsInstallType = "Go" | "Maven" | "Node.js" | "Pip" | "custom";
const DEFAULT_MANIFEST_DIR = ".";
const GO_MOD = "go.mod";
const POM_XML = "pom.xml";
const PACKAGE_JSON = "package.json";
const REQUIREMENTS_TXT = "requirements.txt";
const ALL_MANIFESTS = [
    GO_MOD, POM_XML, PACKAGE_JSON, REQUIREMENTS_TXT,
];

export async function resolveManifestFilePath (manifestFilePathInput: string): Promise<string> {

    if (manifestFilePathInput) {
        return manifestFilePathInput;
    }

    ghCore.info(`"${Inputs.MANIFEST_FILE_PATH}" was not provided. Auto-detecting manifest file in working directory "${process.cwd()}"`);
    ghCore.info(`🔍 Looking for manifest file in "${path.resolve(DEFAULT_MANIFEST_DIR)}"`);

    const autoDetectResult = await autoDetectInstall(DEFAULT_MANIFEST_DIR);
    const manifestFilename = autoDetectResult.filename;
    const resolvedManifestFilePath = path.join(DEFAULT_MANIFEST_DIR, manifestFilename);
    ghCore.info(`Manifest file path is ${resolvedManifestFilePath}`);

    return resolvedManifestFilePath;
}

async function autoDetectInstall(manifestDir: string): Promise<{ filename: string, installType: DepsInstallType }> {
    const manifestDirContents = await fs.readdir(manifestDir);

    for (const filename of manifestDirContents) {
        const installType = getInstallTypeForFile(filename);
        if (installType) {
            return { filename, installType };
        }
    }

    throw new Error(getUnknownManifestError(manifestDir));
}

function getInstallTypeForFile(file: string): DepsInstallType | undefined {
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