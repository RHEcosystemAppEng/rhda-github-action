import * as fs from 'fs';
import * as zlib from 'zlib';
import * as ghCore from '@actions/core';
import * as ghExec from '@actions/exec';

import { Inputs } from './generated/inputs-outputs.js';

type OS = 'linux' | 'macos' | 'windows';
let currentOS: OS | undefined;
let ghToken: string | undefined;
let gitExecutable: string | undefined;

/**
 * Sets the current operating system.
 * @param value - The operating system to set.
 */
export function setCurrentOS(value: OS | undefined) {
    currentOS = value;
}

/**
 * Sets the GitHub token.
 * @param value - The GitHub token to set.
 */
export function setGhToken(value: string | undefined) {
    ghToken = value;
}

/**
 * Sets the Git executable.
 * @param value - The Git executable to set.
 */
export function setGitExecutable(value: string | undefined) {
    gitExecutable = value;
}

/**
 * Gets the current operating system.
 * @returns The current operating system.
 */
export function getOS(): OS {
    if (!currentOS) {
        const rawOS = process.platform;
        if (rawOS === 'win32') {
            setCurrentOS('windows');
        } else if (rawOS === 'darwin') {
            setCurrentOS('macos');
        } else if (rawOS !== 'linux') {
            ghCore.warning(`Unrecognized OS "${rawOS}"`);
            setCurrentOS('linux');
        } else {
            setCurrentOS('linux');
        }
    }

    return currentOS;
}

/**
 *
 * @returns GitHub token provided by the user.
 * If no token is provided, returns the empty string.
 */
export function getGhToken(): string {
    if (!ghToken) {
        ghToken = ghCore.getInput(Inputs.GITHUB_TOKEN);

        if (!ghToken && process.env.GITHUB_TOKEN) {
            ghToken = process.env.GITHUB_TOKEN;
        }
    }
    return ghToken;
}

/**
 * Gets the Git executable.
 * @returns The Git executable.
 */
export function getGitExecutable(): string {
    if (gitExecutable) {
        return gitExecutable;
    }
    const git = getOS() === 'windows' ? 'git.exe' : 'git';
    gitExecutable = git;
    return git;
}

/**
 * Gets an environment variable.
 * @param envName - The name of the environment variable.
 * @returns The value of the environment variable.
 * @throws If the environment variable is not set or is empty.
 */
export function getEnvVar(envName: string): string {
    const value = process.env[envName];
    if (value === undefined || value.length === 0) {
        throw new Error(`❌ ${envName} environment variable must be set`);
    }
    return value;
}

/**
 * Writes data to a file.
 * @param data - The data to write.
 * @param path - The path of the file.
 */
export function writeToFile(data, path) {
    fs.writeFileSync(path, data, 'utf-8');
}

/**
 * Escapes a Windows path for GitHub Actions output.
 * @param path - The path to escape.
 * @returns The escaped path.
 */
export function escapeWindowsPathForActionsOutput(path: string): string {
    return path.replace(/\\/g, '\\\\');
}

/**
 * Zips a file.
 * @param file - The path of the file to zip.
 * @returns The gzipped file as a base64 string.
 */
export async function zipFile(file: string): Promise<string> {
    const fileContents = await fs.readFileSync(file, 'utf-8');
    const zippedContents = (await zlib.gzipSync(fileContents)).toString(
        'base64',
    );
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

/**
 * Executes a command.
 * @param executable - The command to execute.
 * @param args - The arguments to pass to the command.
 * @param options - The options for execution.
 * @returns An object containing the exit code, stdout, and stderr.
 */
export async function execCommand(
    executable: string,
    args: string[],
    options: ghExec.ExecOptions = {},
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
    ghCore.debug(`running "${executable} ${args.join(' ')}"`);

    let stdout = '';
    let stderr = '';

    const execOptions = {
        ...options,
        listeners: {
            stdout: (data: Buffer) => {
                stdout += data.toString();
            },
            stderr: (data: Buffer) => {
                stderr += data.toString();
            },
        },
    };

    const exitCode = await ghExec.exec(executable, args, execOptions);
    return { exitCode, stdout, stderr };
}

/**
 * Gets the current commit SHA.
 * @returns The current commit SHA.
 */
export async function getCommitSha(): Promise<string> {
    const commitSha = (
        await execCommand(getGitExecutable(), ['rev-parse', 'HEAD'])
    ).stdout;
    return commitSha.trim();
}
