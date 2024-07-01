import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as ghCore from '@actions/core';

import * as utils from '../../src/utils';
import * as checkout from '../../src/pr/checkout';

vi.mock('@actions/core', () => ({
    info: vi.fn(),
    debug: vi.fn(),
}));

vi.mock('../../src/utils', () => ({
    getGitExecutable: vi.fn().mockImplementation(() => 'git'),
    execCommand: vi.fn(),
}));

describe('getOriginalCheckoutBranch', () => {
    
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return the current branch', async () => {
        const mockBranchName = 'main';
        vi.mocked(utils.execCommand).mockResolvedValueOnce({
            stdout: `${mockBranchName}\n`,
            exitCode: 0,
            stderr: ''
        });
    
        const branch = await checkout.getOriginalCheckoutBranch();
    
        expect(utils.execCommand).toHaveBeenCalledWith('git', ['branch', '--show-current']);
        expect(branch).toBe(mockBranchName);
    });
});

describe('checkoutPr', () => {
    const baseRepoUrl = 'https://github.com/owner/repo';
    const prNumber = 123;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should checkout the PR branch', async () => {
        const remoteName = `remote-${prNumber}`;
        const localBranchName = `pr-${prNumber}`;
        
        await checkout.checkoutPr(baseRepoUrl, prNumber);
    
        expect(utils.execCommand).toHaveBeenCalledWith('git', [
          'remote',
          'add',
          remoteName,
          baseRepoUrl,
        ]);
        expect(ghCore.info).toHaveBeenCalledWith(`⬇️ Checking out PR #${prNumber} to run RHDA analysis.`);
        expect(utils.execCommand).toHaveBeenCalledWith('git', [
          'fetch',
          remoteName,
          `pull/${prNumber}/head:${localBranchName}`,
        ]);
        expect(utils.execCommand).toHaveBeenCalledWith('git', ['checkout', localBranchName]);
      });
});


describe('checkoutCleanup', () => {
    const prNumber = 123;
    const originalCheckoutBranch = 'main';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should cleanup after the PR branch is checked out', async () => {
        const remoteName = `remote-${prNumber}`;
        const branchName = `pr-${prNumber}`;

        await checkout.checkoutCleanup(prNumber, originalCheckoutBranch);

        expect(ghCore.info).toHaveBeenCalledWith(`Checking out back to ${originalCheckoutBranch} branch.`);
        expect(utils.execCommand).toHaveBeenCalledWith('git', ['checkout', originalCheckoutBranch]);
        expect(ghCore.info).toHaveBeenCalledWith(`Removing the created remote "${remoteName}"`);
        expect(utils.execCommand).toHaveBeenCalledWith('git', ['remote', 'remove', remoteName]);
        expect(ghCore.info).toHaveBeenCalledWith(`Removing created branch "${branchName}"`);
        expect(utils.execCommand).toHaveBeenCalledWith('git', ['branch', '-D', branchName]);
    });
});