import * as fs from 'fs';
import * as zlib from "zlib";
import * as ghCore from "@actions/core";
import * as ghExec from "@actions/exec";
import { Inputs } from "../generated/inputs-outputs.js";
let currentOS;
export function getOS() {
    if (currentOS == null) {
        const rawOS = process.platform;
        if (rawOS === "win32") {
            currentOS = "windows";
        }
        else if (rawOS === "darwin") {
            currentOS = "macos";
        }
        else if (rawOS !== "linux") {
            ghCore.warning(`Unrecognized OS "${rawOS}"`);
            currentOS = "linux";
        }
        else {
            currentOS = "linux";
        }
    }
    return currentOS;
}
let ghToken;
/**
 *
 * @returns GitHub token provided by the user.
 * If no token is provided, returns the empty string.
 */
export function getGhToken() {
    if (ghToken == null) {
        ghToken = ghCore.getInput(Inputs.GITHUB_TOKEN);
        // this to only solve the problem of local development
        if (!ghToken && process.env.GITHUB_TOKEN) {
            ghToken = process.env.GITHUB_TOKEN;
        }
    }
    return ghToken;
}
let gitExecutable;
export function getGitExecutable() {
    if (gitExecutable) {
        return gitExecutable;
    }
    const git = getOS() === "windows" ? "git.exe" : "git";
    gitExecutable = git;
    return git;
}
export function getEnvVar(envName) {
    const value = process.env[envName];
    if (value === undefined || value.length === 0) {
        throw new Error(`❌ ${envName} environment variable must be set`);
    }
    return value;
}
export function writeToFile(data, path) {
    try {
        fs.writeFileSync(path, data, "utf-8");
    }
    catch (err) {
        throw (err);
    }
}
export function escapeWindowsPathForActionsOutput(p) {
    return p.replace(/\\/g, "\\\\");
}
/**
 *
 * @returns The given file as a gzipped string.
 */
export async function zipFile(file) {
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
export function isDefined(obj, ...keys) {
    for (const key of keys) {
        if (!obj || !obj[key]) {
            return false;
        }
        obj = obj[key];
    }
    return true;
}
/**
 * The errors messages from octokit HTTP requests can be poor; prepending the status code helps clarify the problem.
 */
export function prettifyHttpError(err) {
    const status = err.status;
    if (status && err.message) {
        return new Error(`Received status ${status}: ${err.message}`);
    }
    return err;
}
/**
 * Run 'crda' with the given arguments.
 *
 * @throws If the exitCode is not 0, unless execOptions.ignoreReturnCode is set.
 *
 * @param args Arguments and options to 'crda'. Use getOptions to convert an options mapping into a string[].
 * @param execOptions Options for how to run the exec. See note about hideOutput on windows.
 * @returns Exit code and the contents of stdout/stderr.
 */
export async function execCommand(executable, args, options = {}) {
    ghCore.info(`running "${executable} ${args.join(" ")}"`);
    let stdout = "";
    let stderr = "";
    const execOptions = {
        ...options,
        listeners: {
            stdout: (data) => {
                stdout += data.toString();
            },
            stderr: (data) => {
                stderr += data.toString();
            }
        }
    };
    try {
        const exitCode = await ghExec.exec(executable, args, execOptions);
        ghCore.debug(`Exit code ${exitCode}`);
        return { exitCode, stdout, stderr };
    }
    catch (error) {
        ghCore.setFailed(`Execution failed with error: ${error.message}`);
        throw error;
    }
}
export async function getCommitSha() {
    const commitSha = (await execCommand(getGitExecutable(), ["rev-parse", "HEAD"])).stdout;
    return commitSha.trim();
}
//# sourceMappingURL=utils.js.map