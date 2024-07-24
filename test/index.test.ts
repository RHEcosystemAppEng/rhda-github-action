import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as ghCore from '@actions/core';

import * as utils from '../src/utils';
import { resolveManifestFilePath } from '../src/manifestHandler';
import { generateRHDAReport } from '../src/rhda';
import { generateArtifacts } from '../src/artifactHandler';
import { handleSarif } from '../src/sarif/handler';
import { isPr, handlePr } from '../src/pr/handler';
import { getOriginalCheckoutBranch } from '../src/pr/checkout';
import { addLabelsToPr, RhdaLabels } from '../src/pr/labels';
import { run } from '../src/index';
import { Inputs } from '../src/generated/inputs-outputs';
import * as types from '../src/pr/types';

vi.mock('@actions/core', () => ({
    getInput: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    setOutput: vi.fn(),
    warning: vi.fn(),
    setFailed: vi.fn(),
}));

vi.mock('../src/utils', () => ({
    getOS: vi.fn(),
    getCommitSha: vi.fn(),
    getEnvVar: vi.fn(),
}));

vi.mock('../src/pr/handler', () => ({
    isPr: vi.fn(),
    handlePr: vi.fn(),
}));

vi.mock('../src/pr/checkout', () => ({
    getOriginalCheckoutBranch: vi.fn().mockResolvedValue('main'),
}));

vi.mock('../src/manifestHandler', () => ({
    resolveManifestFilePath: vi.fn(),
}));

vi.mock('../src/rhda', () => ({
    generateRHDAReport: vi.fn(),
}));

vi.mock('../src/sarif/handler', () => ({
    handleSarif: vi.fn(),
}));

vi.mock('../src/artifactHandler', () => ({
    generateArtifacts: vi.fn(),
}));

vi.mock('../src/pr/labels', async (importOriginal) => {
    const actual: any = await importOriginal();
    return {
        ...actual,
        addLabelsToPr: vi.fn(),
    };
});

describe('run', () => {
    const mockOS = 'linux';
    const shaMock = 'abcdef123456';
    const refMock = 'refs/heads/main';
    const manifestFilePath = 'path/to/manifest';
    const reportFilePath = 'path/to/rhdaReport.json';
    const sarifFilePath = 'path/to/rhdaReport.sarif';
    const ecosystem = 'maven';
    const reportData = { dummy: 'data' };
    const prData: types.IPrData = {
        author: 'JohnDoe',
        number: 123,
        sha: 'pr-abcdef123456',
        ref: 'pr-refs/heads/main',
        headRepo: {
            owner: 'JohnDoe',
            repo: 'test-repo',
            htmlUrl: 'https://github.com/JohnDoe/test-repo',
        },
        baseRepo: {
            owner: 'baseOwner',
            repo: 'base-repo',
            htmlUrl: 'https://github.com/baseOwner/base-repo',
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(utils.getCommitSha).mockResolvedValue(shaMock);
        vi.mocked(utils.getEnvVar).mockReturnValue(refMock);
        vi.mocked(isPr).mockResolvedValue(undefined);
        vi.mocked(resolveManifestFilePath).mockResolvedValue({
            manifestFilePath: manifestFilePath,
            ecosystem: ecosystem,
        });
        vi.mocked(generateRHDAReport).mockResolvedValue({
            rhdaReportJson: reportData,
            rhdaReportJsonFilePath: reportFilePath,
        });
    });

    it('should run successfully without PR data and with no vulnerabilities', async () => {
        const severity = 'none';

        vi.mocked(handleSarif).mockResolvedValue({
            rhdaReportSarifFilePath: sarifFilePath,
            vulSeverity: severity,
        });
        vi.mocked(utils.getOS).mockReturnValue(mockOS);

        await run();

        expect(ghCore.info).toHaveBeenCalledWith(
            `ℹ️ Working directory is ${process.cwd()}`,
        );
        expect(utils.getOS).toHaveBeenCalled();
        expect(isPr).toHaveBeenCalled();
        expect(getOriginalCheckoutBranch).not.toHaveBeenCalled();
        expect(utils.getCommitSha).toHaveBeenCalled();
        expect(utils.getEnvVar).toHaveBeenCalledWith('GITHUB_REF');
        expect(ghCore.info).toHaveBeenCalledWith(
            `ℹ️ Ref to analyze is "${refMock}"`,
        );
        expect(ghCore.info).toHaveBeenCalledWith(
            `ℹ️ Commit to analyze is "${shaMock}"`,
        );
        expect(resolveManifestFilePath).toHaveBeenCalled();
        expect(generateRHDAReport).toHaveBeenCalledWith(
            manifestFilePath,
            ecosystem,
        );
        expect(handleSarif).toHaveBeenCalledWith(
            reportData,
            manifestFilePath,
            ecosystem,
            shaMock,
            refMock,
            expect.anything(),
            undefined,
        );
        expect(generateArtifacts).toHaveBeenCalled();
        expect(addLabelsToPr).not.toHaveBeenCalled();
        expect(ghCore.info).toHaveBeenCalledWith(
            `✅ No vulnerabilities were found`,
        );
        expect(ghCore.setFailed).not.toHaveBeenCalledWith();
    });

    it('should run successfully without PR data and with HIGH and CRITICAL severity vulnerabilities, fail on error', async () => {
        const severity = 'error';
        const failOn = 'error';

        vi.mocked(handleSarif).mockResolvedValue({
            rhdaReportSarifFilePath: sarifFilePath,
            vulSeverity: severity,
        });
        vi.mocked(ghCore.getInput).mockReturnValue(failOn);
        vi.mocked(utils.getOS).mockReturnValue(mockOS);

        await run();

        expect(ghCore.info).toHaveBeenCalledWith(
            `Input "${Inputs.FAIL_ON}" is "${failOn}", and at least one error was found. Failing workflow.`,
        );
        expect(ghCore.setFailed).toHaveBeenCalledWith(
            `Found high severity vulnerabilities in the project.`,
        );
    });

    it('should run successfully without PR data and with HIGH and CRITICAL severity vulnerabilities, fail on warning', async () => {
        const severity = 'error';
        const failOn = 'warning';

        vi.mocked(handleSarif).mockResolvedValue({
            rhdaReportSarifFilePath: sarifFilePath,
            vulSeverity: severity,
        });
        vi.mocked(ghCore.getInput).mockReturnValue(failOn);
        vi.mocked(utils.getOS).mockReturnValue(mockOS);

        await run();

        expect(ghCore.info).toHaveBeenCalledWith(
            `Input "${Inputs.FAIL_ON}" is "${failOn}", and at least one warning was found. Failing workflow.`,
        );
        expect(ghCore.setFailed).toHaveBeenCalledWith(
            `Found vulnerabilities in the project.`,
        );
    });

    it('should run successfully without PR data and with LOW and MEDIUM severity vulnerabilities, fail on error', async () => {
        const severity = 'warning';
        const failOn = 'error';

        vi.mocked(handleSarif).mockResolvedValue({
            rhdaReportSarifFilePath: sarifFilePath,
            vulSeverity: severity,
        });
        vi.mocked(ghCore.getInput).mockReturnValue(failOn);
        vi.mocked(utils.getOS).mockReturnValue(mockOS);

        await run();

        expect(ghCore.setFailed).not.toHaveBeenCalled();
    });

    it('should run successfully without PR data and with LOW and MEDIUM severity vulnerabilities, fail on warning', async () => {
        const severity = 'warning';
        const failOn = 'warning';

        vi.mocked(handleSarif).mockResolvedValue({
            rhdaReportSarifFilePath: sarifFilePath,
            vulSeverity: severity,
        });
        vi.mocked(ghCore.getInput).mockReturnValue(failOn);
        vi.mocked(utils.getOS).mockReturnValue(mockOS);

        await run();

        expect(ghCore.info).toHaveBeenCalledWith(
            `Input "${Inputs.FAIL_ON}" is "${failOn}", and at least one warning was found. Failing workflow.`,
        );
        expect(ghCore.setFailed).toHaveBeenCalledWith(
            `Found vulnerabilities in the project.`,
        );
    });

    it('should run successfully without PR data and with vulnerabilities, fail on never', async () => {
        const severity = 'error';
        const failOn = 'never';

        vi.mocked(handleSarif).mockResolvedValue({
            rhdaReportSarifFilePath: sarifFilePath,
            vulSeverity: severity,
        });
        vi.mocked(ghCore.getInput).mockReturnValue(failOn);
        vi.mocked(utils.getOS).mockReturnValue(mockOS);

        await run();

        expect(ghCore.warning).toHaveBeenCalledWith(
            `Found "${severity}" level vulnerabilities`,
        );
        expect(ghCore.info).toHaveBeenCalledWith(
            `Input "${Inputs.FAIL_ON}" is "${failOn}". Not failing workflow.`,
        );
        expect(ghCore.setFailed).not.toHaveBeenCalled();
    });

    it('should run successfully with PR data and with no vulnerabilitues', async () => {
        const severity = 'none';

        vi.mocked(handleSarif).mockResolvedValue({
            rhdaReportSarifFilePath: sarifFilePath,
            vulSeverity: severity,
        });

        vi.mocked(isPr).mockResolvedValue(prData);

        await run();

        expect(ghCore.info).toHaveBeenCalledWith(
            `ℹ️ Working directory is ${process.cwd()}`,
        );
        expect(utils.getOS).toHaveBeenCalled();
        expect(isPr).toHaveBeenCalled();
        expect(getOriginalCheckoutBranch).toHaveBeenCalled();
        expect(handlePr).toHaveBeenCalledWith(prData);
        expect(utils.getCommitSha).not.toHaveBeenCalled();
        expect(utils.getEnvVar).not.toHaveBeenCalledWith('GITHUB_REF');
        expect(ghCore.info).toHaveBeenCalledWith(
            `ℹ️ Ref to analyze is "${prData.ref}"`,
        );
        expect(ghCore.info).toHaveBeenCalledWith(
            `ℹ️ Commit to analyze is "${prData.sha}"`,
        );
        expect(resolveManifestFilePath).toHaveBeenCalled();
        expect(generateRHDAReport).toHaveBeenCalledWith(
            manifestFilePath,
            ecosystem,
        );
        expect(handleSarif).toHaveBeenCalledWith(
            reportData,
            manifestFilePath,
            ecosystem,
            prData.sha,
            prData.ref,
            expect.anything(),
            prData,
        );
        expect(generateArtifacts).toHaveBeenCalled();
        expect(addLabelsToPr).toHaveBeenCalledWith(prData.number, [
            RhdaLabels.RHDA_SCAN_PASSED,
        ]);
        expect(ghCore.info).toHaveBeenCalledWith(
            `✅ No vulnerabilities were found`,
        );
        expect(ghCore.setFailed).not.toHaveBeenCalledWith();
    });

    it('should run successfully with PR data and with HIGH and CRITICAL severity vulnerabilitues', async () => {
        const severity = 'error';

        vi.mocked(handleSarif).mockResolvedValue({
            rhdaReportSarifFilePath: sarifFilePath,
            vulSeverity: severity,
        });

        vi.mocked(isPr).mockResolvedValue(prData);

        await run();

        expect(addLabelsToPr).toHaveBeenCalledWith(prData.number, [
            RhdaLabels.RHDA_FOUND_ERROR,
        ]);
    });

    it('should run successfully with PR data and with LOW and MEDIUM severity vulnerabilitues', async () => {
        const severity = 'warning';

        vi.mocked(handleSarif).mockResolvedValue({
            rhdaReportSarifFilePath: sarifFilePath,
            vulSeverity: severity,
        });

        vi.mocked(isPr).mockResolvedValue(prData);

        await run();

        expect(addLabelsToPr).toHaveBeenCalledWith(prData.number, [
            RhdaLabels.RHDA_FOUND_WARNING,
        ]);
    });
});
