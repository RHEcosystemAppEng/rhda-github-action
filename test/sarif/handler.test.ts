import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as ghCore from '@actions/core';
import * as github from '@actions/github';

import * as constants from '../../src/constants';
import * as utils from '../../src/utils';
import { handleSarif } from '../../src/sarif/handler';
import * as convert from '../../src/sarif/convert';
import * as upload from '../../src/sarif/upload';
import * as types from '../../src/pr/types';
import { Outputs, Inputs } from '../../src/generated/inputs-outputs';

vi.mock('@actions/core', () => ({
    info: vi.fn(),
    getInput: vi.fn(),
    setOutput: vi.fn(),
    getBooleanInput: vi.fn(),
}));

vi.mock('../../src/utils', () => ({
    getOS: vi.fn(),
}));

vi.mock('../../src/utils', async (importOriginal) => {
    const actual: any = await importOriginal();
    return {
        ...actual,
        getOS: vi.fn(),
        getGhToken: vi.fn(),
        writeToFile: vi.fn(),
    };
});

vi.mock('../../src/sarif/convert');
vi.mock('../../src/sarif/upload');
vi.mock('../../src/constants');

describe('handleSarif', () => {
    const sarifObject = { sarif: 'sarif' };
    const vulSeverity: constants.VulnerabilitySeverity = 'error';
    const rhdaReportJson = { data: 'data' };
    const ecosystem = 'maven';
    const sha = 'abcdef123456';
    const ref = 'refs/heads/main';
    const analysisStartTime = '2023-01-01T00:00:00Z';
    const reportFileName = 'report';
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
        const manifestFilePath = 'path/to/manifest';
        const rhdaReportSarifFilePath = `${process.cwd()}/${reportFileName}.sarif`;

        vi.mocked(utils.getOS).mockImplementation(() => 'linux');
        vi.mocked(convert.generateSarif).mockResolvedValue({
            sarifObject,
            vulSeverity,
        });
        vi.mocked(ghCore.getInput).mockReturnValue(reportFileName);
        vi.mocked(ghCore.getBooleanInput).mockReturnValue(true);
        vi.mocked(utils.getGhToken).mockReturnValue('gh-token');
        process.env.GITHUB_REPOSITORY = 'test-repo';

        const result = await handleSarif(
            rhdaReportJson,
            manifestFilePath,
            ecosystem,
            sha,
            ref,
            analysisStartTime,
            prData,
        );

        expect(convert.generateSarif).toHaveBeenCalledWith(
            rhdaReportJson,
            manifestFilePath,
            ecosystem,
        );
        expect(utils.writeToFile).toHaveBeenCalledWith(
            JSON.stringify(sarifObject, null, 4),
            rhdaReportSarifFilePath,
        );
        expect(ghCore.info).toHaveBeenCalledWith(
            `✅ Successfully converted RHDA report JSON to SARIF`,
        );
        expect(ghCore.info).toHaveBeenCalledWith(
            `✍️ Setting output "${Outputs.RHDA_REPORT_SARIF}" to ${rhdaReportSarifFilePath}`,
        );
        expect(ghCore.setOutput).toHaveBeenCalledWith(
            Outputs.RHDA_REPORT_SARIF,
            utils.escapeWindowsPathForActionsOutput(rhdaReportSarifFilePath),
        );
        expect(upload.uploadSarifFile).toHaveBeenCalledWith(
            'gh-token',
            rhdaReportSarifFilePath,
            analysisStartTime,
            sha,
            ref,
            github.context.repo,
            true,
        );
        expect(result).toEqual({
            rhdaReportSarifFilePath: rhdaReportSarifFilePath,
            vulSeverity,
        });
    });

    it('should skip SARIF upload if not configured', async () => {
        const manifestFilePath = 'D:path\\to\\manifest';
        const rhdaReportSarifFilePath = `${process.cwd()}\\${reportFileName}.sarif`;

        vi.mocked(utils.getOS).mockImplementation(() => 'windows');
        vi.mocked(convert.generateSarif).mockResolvedValue({
            sarifObject,
            vulSeverity,
        });
        vi.mocked(ghCore.getInput).mockReturnValue(reportFileName);
        vi.mocked(ghCore.getBooleanInput).mockReturnValue(false);

        const result = await handleSarif(
            rhdaReportJson,
            manifestFilePath,
            ecosystem,
            sha,
            ref,
            analysisStartTime,
            prData,
        );

        expect(convert.generateSarif).toHaveBeenCalledWith(
            rhdaReportJson,
            manifestFilePath,
            ecosystem,
        );
        expect(utils.writeToFile).toHaveBeenCalledWith(
            JSON.stringify(sarifObject, null, 4),
            rhdaReportSarifFilePath,
        );
        expect(ghCore.info).toHaveBeenCalledWith(
            `✅ Successfully converted RHDA report JSON to SARIF`,
        );
        expect(ghCore.info).toHaveBeenCalledWith(
            `✍️ Setting output "${Outputs.RHDA_REPORT_SARIF}" to ${rhdaReportSarifFilePath}`,
        );
        expect(ghCore.setOutput).toHaveBeenCalledWith(
            Outputs.RHDA_REPORT_SARIF,
            utils.escapeWindowsPathForActionsOutput(rhdaReportSarifFilePath),
        );
        expect(upload.uploadSarifFile).not.toHaveBeenCalled();
        expect(ghCore.info).toHaveBeenCalledWith(
            `⏩ Input "${Inputs.UPLOAD_SARIF}" is false, skipping SARIF upload.`,
        );
        expect(result).toEqual({
            rhdaReportSarifFilePath: rhdaReportSarifFilePath,
            vulSeverity,
        });
    });
});
