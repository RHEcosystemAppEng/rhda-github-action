import * as ghCore from '@actions/core';

import { getGitExecutable, execCommand } from '../utils.js';

export async function getOriginalCheckoutBranch(): Promise<string> {
    const branch = (await execCommand(getGitExecutable(), [ 'branch', '--show-current' ])).stdout;
    return branch.trim();
}

/**
 * Checkout PR code to run the CRDA Analysis on a PR,
 * After completion of the scan this created remote and branch
 * will be deleted and branch will be checkedout the present branch
 */
export async function checkoutPr(baseRepoUrl: string, prNumber: number): Promise<void> {
    const remoteName = getPRRemoteName(prNumber);
    const localbranchName = getPRBranchName(prNumber);

    ghCore.debug(`Adding remote ${baseRepoUrl}`);
    await execCommand(getGitExecutable(), [ 'remote', 'add', remoteName, baseRepoUrl ]);
    
    ghCore.info(`⬇️ Checking out PR #${prNumber} to run RHDA analysis.`);
    await execCommand(getGitExecutable(), [ 'fetch', remoteName, `pull/${prNumber}/head:${localbranchName}` ]);
    await execCommand(getGitExecutable(), [ 'checkout', localbranchName ]);
}

// Do cleanup after the crda scan and checkout
// back to the original branch
export async function checkoutCleanup(prNumber: number, originalCheckoutBranch: string): Promise<void> {
    const remoteName = getPRRemoteName(prNumber);
    const branchName = getPRBranchName(prNumber);
    
    ghCore.info(`Checking out back to ${originalCheckoutBranch} branch.`);
    await execCommand(getGitExecutable(), [ 'checkout', originalCheckoutBranch ]);

    ghCore.info(`Removing the created remote "${remoteName}"`);
    await execCommand(getGitExecutable(), [ 'remote', 'remove', remoteName ]);

    ghCore.info(`Removing created branch "${branchName}"`);
    await execCommand(getGitExecutable(), [ 'branch', '-D', `${branchName}` ]);
}

function getPRRemoteName(prNumber: number): string {
    return `remote-${prNumber}`;
}

function getPRBranchName(prNumber: number): string {
    return `pr-${prNumber}`;
}
