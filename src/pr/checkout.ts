import * as ghCore from '@actions/core';

import { getGitExecutable, execCommand } from '../utils.js';

/**
 * Retrieves the name of the original checkout branch.
 * @returns The name of the original checkout branch.
 */
export async function getOriginalCheckoutBranch(): Promise<string> {
    const branch = (
        await execCommand(getGitExecutable(), ['branch', '--show-current'])
    ).stdout;
    return branch.trim();
}

/**
 * Checks out a pull request branch from a remote repository.
 * After scan completion, this remote and branch will be deleted and original branch will be checked out.
 * @param baseRepoUrl - The URL of the base repository.
 * @param prNumber - The number of the pull request.
 */
export async function checkoutPr(
    baseRepoUrl: string,
    prNumber: number,
): Promise<void> {
    const remoteName = getPRRemoteName(prNumber);
    const localbranchName = getPRBranchName(prNumber);

    ghCore.debug(`Adding remote ${baseRepoUrl}`);
    await execCommand(getGitExecutable(), [
        'remote',
        'add',
        remoteName,
        baseRepoUrl,
    ]);

    ghCore.info(`⬇️ Checking out PR #${prNumber} to run RHDA analysis.`);
    await execCommand(getGitExecutable(), [
        'fetch',
        remoteName,
        `pull/${prNumber}/head:${localbranchName}`,
    ]);
    await execCommand(getGitExecutable(), ['checkout', localbranchName]);
}

/**
 * Cleans up the branches and remotes created during the pull request checkout process.
 * @param prNumber - The number of the pull request.
 * @param originalCheckoutBranch - The name of the original checkout branch.
 */
export async function checkoutCleanup(
    prNumber: number,
    originalCheckoutBranch: string,
): Promise<void> {
    const remoteName = getPRRemoteName(prNumber);
    const branchName = getPRBranchName(prNumber);

    ghCore.info(`Checking out back to ${originalCheckoutBranch} branch.`);
    await execCommand(getGitExecutable(), ['checkout', originalCheckoutBranch]);

    ghCore.info(`Removing the created remote "${remoteName}"`);
    await execCommand(getGitExecutable(), ['remote', 'remove', remoteName]);

    ghCore.info(`Removing created branch "${branchName}"`);
    await execCommand(getGitExecutable(), ['branch', '-D', `${branchName}`]);
}

/**
 * Gets the remote name for a pull request.
 * @param prNumber - The number of the pull request.
 * @returns The remote name for the pull request.
 */
function getPRRemoteName(prNumber: number): string {
    return `remote-${prNumber}`;
}

/**
 * Gets the branch name for a pull request.
 * @param prNumber - The number of the pull request.
 * @returns The branch name for the pull request.
 */
function getPRBranchName(prNumber: number): string {
    return `pr-${prNumber}`;
}
