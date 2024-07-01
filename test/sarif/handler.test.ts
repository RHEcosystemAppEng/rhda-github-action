import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as ghCore from '@actions/core';
import * as github from '@actions/github';

import * as constants from '../../src/constants';
import * as utils from '../../src/utils';
import { handleSarif } from '../../src/sarif/handler';
import * as convert from '../../src/sarif/convert';
import * as upload from '../../src/sarif/upload';
import * as types from '../../src/pr/types';
import { Outputs } from '../../src/generated/inputs-outputs';

vi.mock('@actions/core', () => ({
    info: vi.fn(),
    getInput: vi.fn(),
    setOutput: vi.fn(),
    getBooleanInput: vi.fn(),
}));

vi.mock('../../src/sarif/convert');
vi.mock('../../src/sarif/upload');
vi.mock('../../src/constants');
vi.mock('../../src/utils');

describe('handleSarif', () => {
    const sarifObject = { sarif: 'sarif' };
    const vulSeverity:constants.VulnerabilitySeverity = 'error';
    const rhdaReportJson = { data: 'data' };
    const manifestFilePath = 'path/to/manifest';
    const ecosystem = 'maven';
    const sha = 'abcdef123456';
    const ref = 'refs/heads/main';
    const analysisStartTime = '2023-01-01T00:00:00Z';
    const reportFileName = 'report';
    const escapedPathToReportSarif = `escaped/path/to/${reportFileName}.sarif`;
    const prData: types.IPrData = {
        author: 'JohnDoe',
        number: 123,
        sha: 'abc123',
        ref: 'refs/heads/main',
        headRepo: {
            owner: 'JohnDoe',
            repo: 'test-repo',
            htmlUrl: 'https://github.com/JohnDoe/test-repo',
        },
        baseRepo: {
            owner: 'JohnDoe',
            repo: 'test-repo',
            htmlUrl: 'https://github.com/JohnDoe/test-repo',
        },
      };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should convert RHDA report JSON to SARIF and upload if configured', async () => {

        vi.mocked(convert.generateSarif).mockResolvedValue({ sarifObject, vulSeverity });
        vi.mocked(ghCore.getInput).mockReturnValue(reportFileName);
        vi.mocked(utils.escapeWindowsPathForActionsOutput).mockReturnValue(escapedPathToReportSarif);
        vi.mocked(ghCore.getBooleanInput).mockReturnValue(true);
        vi.mocked(utils.getGhToken).mockReturnValue('gh-token');
        process.env.GITHUB_REPOSITORY = 'test-repo'

        const result = await handleSarif(
            rhdaReportJson,
            manifestFilePath,
            ecosystem,
            sha,
            ref,
            analysisStartTime,
            prData
        );

        expect(convert.generateSarif).toHaveBeenCalledWith(rhdaReportJson, manifestFilePath, ecosystem);
        expect(utils.writeToFile).toHaveBeenCalledWith(JSON.stringify(sarifObject, null, 4), `${process.cwd()}/${reportFileName}.sarif`);
        expect(ghCore.setOutput).toHaveBeenCalledWith(Outputs.RHDA_REPORT_SARIF, escapedPathToReportSarif);
        expect(upload.uploadSarifFile).toHaveBeenCalledWith(
            'gh-token',
            `${process.cwd()}/${reportFileName}.sarif`,
            analysisStartTime,
            sha,
            ref,
            github.context.repo,
            true
        );
        expect(result).toEqual({ rhdaReportSarifFilePath: `${process.cwd()}/${reportFileName}.sarif`, vulSeverity });
    });

    it('should skip SARIF upload if not configured', async () => {

        vi.mocked(convert.generateSarif).mockResolvedValue({ sarifObject, vulSeverity });
        vi.mocked(ghCore.getInput).mockReturnValue(reportFileName);
        vi.mocked(utils.escapeWindowsPathForActionsOutput).mockReturnValue(escapedPathToReportSarif);
        vi.mocked(ghCore.getBooleanInput).mockReturnValue(false);

        const result = await handleSarif(
            rhdaReportJson,
            manifestFilePath,
            ecosystem,
            sha,
            ref,
            analysisStartTime,
            prData
        );

        expect(upload.uploadSarifFile).not.toHaveBeenCalled();
        expect(result).toEqual({ rhdaReportSarifFilePath: `${process.cwd()}/${reportFileName}.sarif`, vulSeverity });
    });
});

