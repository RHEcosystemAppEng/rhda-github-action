import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as ghCore from '@actions/core';
import { Octokit } from '@octokit/core';
import * as github from '@actions/github';

import { uploadSarifFile } from '../../src/sarif/upload';
import * as utils from '../../src/utils';

vi.mock('@actions/core', () => ({
    info: vi.fn(),
    debug: vi.fn(),
    startGroup: vi.fn(),
    endGroup: vi.fn(),
}));

vi.mock('../../src/utils', () => ({
    getEnvVar: vi.fn(),
    zipFile: vi.fn(),
}));

vi.mock('@octokit/core');

describe('uploadSarifFile', () => {
    const ghToken = 'dummy-token';
    const sarifPath = '/path/to/sarif.sarif';
    const analysisStartTime = '2023-01-01T00:00:00Z';
    const sha = 'abcdef123456';
    const ref = 'refs/heads/main';
    const uploadToRepo = { owner: 'owner', repo: 'repo' };
    const sarifZipped = 'zipped-sarif-data';
    process.env.GITHUB_REPOSITORY = 'test-repo';

    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(utils.zipFile).mockResolvedValue(sarifZipped);
        vi.mocked(utils.getEnvVar).mockReturnValue('https://github.com');
    });

    it('should upload SARIF file successfully and print security tab link with branch', async () => {
        const printSecurityTabLink = true;
        const ocktokitResponse = {
            data: { id: 'sarif-id', processing_status: 'complete' },
        };
        const octokitMock = {
            request: vi.fn().mockResolvedValue(ocktokitResponse),
        };
        (Octokit as any).mockImplementation(() => octokitMock as any);

        await uploadSarifFile(
            ghToken,
            sarifPath,
            analysisStartTime,
            sha,
            ref,
            uploadToRepo,
            printSecurityTabLink,
        );

        expect(utils.zipFile).toHaveBeenCalledWith(sarifPath);
        expect(ghCore.info).toHaveBeenNthCalledWith(
            1,
            `⬆️ Uploading SARIF to ${uploadToRepo.owner}/${uploadToRepo.repo}`,
        );
        expect(octokitMock.request).toHaveBeenCalledWith(
            'POST /repos/{owner}/{repo}/code-scanning/sarifs',
            {
                owner: uploadToRepo.owner,
                repo: uploadToRepo.repo,
                ref: ref,
                commit_sha: sha,
                sarif: sarifZipped,
                started_at: analysisStartTime,
                tool_name: 'Red Hat Dependency Analytics',
            },
        );
        expect(ghCore.startGroup).toHaveBeenNthCalledWith(
            1,
            `⏳ Waiting for SARIF to upload...`,
        );
        expect(octokitMock.request).toHaveBeenCalledWith(
            'GET /repos/{owner}/{repo}/code-scanning/sarifs/{sarif_id}',
            {
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                sarif_id: ocktokitResponse.data.id,
            },
        );
        expect(ghCore.endGroup).toHaveBeenCalled();
        expect(ghCore.info).toHaveBeenNthCalledWith(
            2,
            `Upload is ${ocktokitResponse.data.processing_status}`,
        );
        expect(ghCore.info).toHaveBeenNthCalledWith(
            3,
            `✅ Successfully uploaded SARIF file`,
        );
        expect(utils.getEnvVar).toHaveBeenCalledWith('GITHUB_SERVER_URL');
        expect(ghCore.info).toHaveBeenNthCalledWith(
            4,
            `👀 Review the Code Scanning results in the Security tab: https://github.com/owner/repo/security/code-scanning?${new URLSearchParams('query=is:open sort:created-desc branch:main')}`,
        );
    });

    it('should upload SARIF file successfully and print security tab link without branch', async () => {
        const refWoBranch = 'refs/heads';
        const printSecurityTabLink = true;
        const ocktokitResponse = {
            data: { id: 'sarif-id', processing_status: 'complete' },
        };
        const octokitMock = {
            request: vi.fn().mockResolvedValue(ocktokitResponse),
        };
        (Octokit as any).mockImplementation(() => octokitMock as any);

        await uploadSarifFile(
            ghToken,
            sarifPath,
            analysisStartTime,
            sha,
            refWoBranch,
            uploadToRepo,
            printSecurityTabLink,
        );

        expect(utils.zipFile).toHaveBeenCalledWith(sarifPath);
        expect(ghCore.info).toHaveBeenNthCalledWith(
            1,
            `⬆️ Uploading SARIF to ${uploadToRepo.owner}/${uploadToRepo.repo}`,
        );
        expect(octokitMock.request).toHaveBeenCalledWith(
            'POST /repos/{owner}/{repo}/code-scanning/sarifs',
            {
                owner: uploadToRepo.owner,
                repo: uploadToRepo.repo,
                ref: refWoBranch,
                commit_sha: sha,
                sarif: sarifZipped,
                started_at: analysisStartTime,
                tool_name: 'Red Hat Dependency Analytics',
            },
        );
        expect(ghCore.startGroup).toHaveBeenNthCalledWith(
            1,
            `⏳ Waiting for SARIF to upload...`,
        );
        expect(octokitMock.request).toHaveBeenCalledWith(
            'GET /repos/{owner}/{repo}/code-scanning/sarifs/{sarif_id}',
            {
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                sarif_id: ocktokitResponse.data.id,
            },
        );
        expect(ghCore.endGroup).toHaveBeenCalled();
        expect(ghCore.info).toHaveBeenNthCalledWith(
            2,
            `Upload is ${ocktokitResponse.data.processing_status}`,
        );
        expect(ghCore.info).toHaveBeenNthCalledWith(
            3,
            `✅ Successfully uploaded SARIF file`,
        );
        expect(utils.getEnvVar).toHaveBeenCalledWith('GITHUB_SERVER_URL');
        expect(ghCore.info).toHaveBeenNthCalledWith(
            4,
            `👀 Review the Code Scanning results in the Security tab: https://github.com/owner/repo/security/code-scanning?${new URLSearchParams('query=is:open sort:created-desc')}`,
        );
    });

    it('should upload SARIF file successfully and not print security tab link', async () => {
        const printSecurityTabLink = false;
        const ocktokitResponse = {
            data: { id: 'sarif-id', processing_status: 'complete' },
        };
        const octokitMock = {
            request: vi.fn().mockResolvedValue(ocktokitResponse),
        };
        (Octokit as any).mockImplementation(() => octokitMock as any);

        await uploadSarifFile(
            ghToken,
            sarifPath,
            analysisStartTime,
            sha,
            ref,
            uploadToRepo,
            printSecurityTabLink,
        );

        expect(utils.zipFile).toHaveBeenCalledWith(sarifPath);
        expect(ghCore.info).toBeCalledTimes(3);
        expect(ghCore.info).toHaveBeenNthCalledWith(
            1,
            `⬆️ Uploading SARIF to ${uploadToRepo.owner}/${uploadToRepo.repo}`,
        );
        expect(octokitMock.request).toHaveBeenCalledWith(
            'POST /repos/{owner}/{repo}/code-scanning/sarifs',
            {
                owner: uploadToRepo.owner,
                repo: uploadToRepo.repo,
                ref,
                commit_sha: sha,
                sarif: sarifZipped,
                started_at: analysisStartTime,
                tool_name: 'Red Hat Dependency Analytics',
            },
        );
        expect(ghCore.startGroup).toHaveBeenNthCalledWith(
            1,
            `⏳ Waiting for SARIF to upload...`,
        );
        expect(octokitMock.request).toHaveBeenCalledWith(
            'GET /repos/{owner}/{repo}/code-scanning/sarifs/{sarif_id}',
            {
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                sarif_id: ocktokitResponse.data.id,
            },
        );
        expect(ghCore.endGroup).toHaveBeenCalled();
        expect(ghCore.info).toHaveBeenNthCalledWith(
            2,
            `Upload is ${ocktokitResponse.data.processing_status}`,
        );
        expect(ghCore.info).toHaveBeenNthCalledWith(
            3,
            `✅ Successfully uploaded SARIF file`,
        );
        expect(utils.getEnvVar).not.toHaveBeenCalled();
    });

    it('should throw error if SARIF upload does not return an ID', async () => {
        const printSecurityTabLink = true;
        const ocktokitResponse = {
            data: { processing_status: 'complete' },
        };
        const octokitMock = {
            request: vi.fn().mockResolvedValue(ocktokitResponse),
        };
        (Octokit as any).mockImplementation(() => octokitMock as any);

        try {
            await uploadSarifFile(
                ghToken,
                sarifPath,
                analysisStartTime,
                sha,
                ref,
                uploadToRepo,
                printSecurityTabLink,
            );
            throw new Error('Expected error to be thrown');
        } catch (error) {
            expect(error.message).toEqual(
                'Upload SARIF response from GitHub did not include an upload ID',
            );
        }

        expect(utils.zipFile).toHaveBeenCalledWith(sarifPath);
        expect(ghCore.info).toHaveBeenCalledOnce();
        expect(ghCore.info).toHaveBeenCalledWith(
            `⬆️ Uploading SARIF to ${uploadToRepo.owner}/${uploadToRepo.repo}`,
        );
        expect(octokitMock.request).toHaveBeenCalledOnce();
        expect(octokitMock.request).toHaveBeenCalledWith(
            'POST /repos/{owner}/{repo}/code-scanning/sarifs',
            {
                owner: uploadToRepo.owner,
                repo: uploadToRepo.repo,
                ref,
                commit_sha: sha,
                sarif: sarifZipped,
                started_at: analysisStartTime,
                tool_name: 'Red Hat Dependency Analytics',
            },
        );
        expect(ghCore.startGroup).not.toHaveBeenCalled();
        expect(ghCore.endGroup).not.toHaveBeenCalled();
        expect(utils.getEnvVar).not.toHaveBeenCalled();
    });

    it('should throw error if SARIF upload times out', async () => {
        const printSecurityTabLink = true;
        const ocktokitResponse = {
            data: { id: 'sarif-id', processing_status: 'pending' },
        };
        const octokitMock = {
            request: vi.fn().mockResolvedValue(ocktokitResponse),
        };
        (Octokit as any).mockImplementation(() => octokitMock as any);

        try {
            await uploadSarifFile(
                ghToken,
                sarifPath,
                analysisStartTime,
                sha,
                ref,
                uploadToRepo,
                printSecurityTabLink,
            );
            throw new Error('Expected error to be thrown');
        } catch (error) {
            expect(error.message).toEqual(
                `SARIF upload timed out: status was ${ocktokitResponse.data.processing_status} after 120s.`,
            );
        }

        expect(utils.zipFile).toHaveBeenCalledWith(sarifPath);
        expect(ghCore.info).toHaveBeenNthCalledWith(
            1,
            `⬆️ Uploading SARIF to ${uploadToRepo.owner}/${uploadToRepo.repo}`,
        );
        expect(octokitMock.request).toHaveBeenCalledWith(
            'POST /repos/{owner}/{repo}/code-scanning/sarifs',
            {
                owner: uploadToRepo.owner,
                repo: uploadToRepo.repo,
                ref,
                commit_sha: sha,
                sarif: sarifZipped,
                started_at: analysisStartTime,
                tool_name: 'Red Hat Dependency Analytics',
            },
        );
        expect(ghCore.startGroup).toHaveBeenNthCalledWith(
            1,
            `⏳ Waiting for SARIF to upload...`,
        );
        expect(octokitMock.request).toHaveBeenCalledWith(
            'GET /repos/{owner}/{repo}/code-scanning/sarifs/{sarif_id}',
            {
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                sarif_id: ocktokitResponse.data.id,
            },
        );
        expect(ghCore.endGroup).toHaveBeenCalled();
        expect(ghCore.info).toHaveBeenNthCalledWith(
            2,
            `⏳ Upload is ${ocktokitResponse.data.processing_status}`,
        );
        expect(utils.getEnvVar).not.toHaveBeenCalled();
    }, 130000);
});
