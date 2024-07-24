import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as ghCore from '@actions/core';

import * as exhortServices from '../src/exhortServices';
import { Inputs, Outputs } from '../src/generated/inputs-outputs';
import { UTM_SOURCE, DOCKER, MAVEN } from '../src/constants';
import * as imageAnalysis from '../src/imageAnalysis';
import * as utils from '../src/utils';
import { generateRHDAReport } from '../src/rhda';

vi.mock('@actions/core', () => ({
    getInput: vi.fn(),
    info: vi.fn(),
    setOutput: vi.fn(),
}));

vi.mock('../src/exhortServices', () => ({
    stackAnalysisService: vi.fn(),
}));

vi.mock('../src/imageAnalysis', () => ({
    executeDockerImageAnalysis: vi.fn(),
}));

vi.mock('../src/utils', async (importOriginal) => {
    const actual: any = await importOriginal();
    return {
        ...actual,
        writeToFile: vi.fn(),
        getOS: vi.fn(),
    };
});

describe('generateRHDAReport', () => {
    const rhdaReportJson = 'Example Analysis Report';

    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(ghCore.getInput).mockImplementation((name) => {
            const inputs = {
                [Inputs.MATCH_MANIFEST_VERSION]: 'true',
                [Inputs.USE_PYTHON_VIRTUAL_ENVIRONMENT]: 'false',
                [Inputs.ENABLE_PYTHON_BEST_EFFORTS_INSTALLATION]: 'false',
                [Inputs.USE_GO_MVS]: 'false',
                [Inputs.USE_PIP_DEP_TREE]: 'false',
                [Inputs.MVN_EXECUTABLE_PATH]: '/path/to/mvn',
                [Inputs.GRADLE_EXECUTABLE_PATH]: '/path/to/gradle',
                [Inputs.NPM_EXECUTABLE_PATH]: '/path/to/npm',
                [Inputs.GO_EXECUTABLE_PATH]: '/path/to/go',
                [Inputs.PYTHON3_EXECUTABLE_PATH]: '/path/to/python3',
                [Inputs.PIP3_EXECUTABLE_PATH]: '/path/to/pip3',
                [Inputs.PYTHON_EXECUTABLE_PATH]: '/path/to/python',
                [Inputs.PIP_EXECUTABLE_PATH]: '/path/to/pip',
                [Inputs.RHDA_REPORT_NAME]: 'report',
            };
            return inputs[name];
        });

        vi.mocked(exhortServices.stackAnalysisService).mockResolvedValue(
            rhdaReportJson,
        );

        vi.mocked(imageAnalysis.executeDockerImageAnalysis).mockResolvedValue(
            rhdaReportJson,
        );
    });

    it('should generate the RHDA report for non-Docker ecosystem', async () => {
        const manifestFilePath = 'D:path\\to\\manifest';
        const rhdaReportJsonFilePath = `${process.cwd()}\\report.json`;
        vi.mocked(utils.getOS).mockImplementation(() => 'windows');

        const result = await generateRHDAReport(manifestFilePath, MAVEN);

        expect(ghCore.info).toBeCalledWith(`⏳ Analysing dependencies...`);
        expect(exhortServices.stackAnalysisService).toHaveBeenCalledWith(
            manifestFilePath,
            {
                RHDA_SOURCE: UTM_SOURCE,
                MATCH_MANIFEST_VERSIONS: 'true',
                EXHORT_PYTHON_VIRTUAL_ENV: 'false',
                EXHORT_PYTHON_INSTALL_BEST_EFFORTS: 'false',
                EXHORT_GO_MVS_LOGIC_ENABLED: 'false',
                EXHORT_PIP_USE_DEP_TREE: 'false',
                EXHORT_MVN_PATH: '/path/to/mvn',
                EXHORT_GRADLE_PATH: '/path/to/gradle',
                EXHORT_NPM_PATH: '/path/to/npm',
                EXHORT_GO_PATH: '/path/to/go',
                EXHORT_PYTHON3_PATH: '/path/to/python3',
                EXHORT_PIP3_PATH: '/path/to/pip3',
                EXHORT_PYTHON_PATH: '/path/to/python',
                EXHORT_PIP_PATH: '/path/to/pip',
            },
        );
        expect(utils.writeToFile).toHaveBeenCalledWith(
            JSON.stringify(rhdaReportJson, null, 4),
            rhdaReportJsonFilePath,
        );
        expect(ghCore.info).toBeCalledWith(
            `✍️ Setting output "${Outputs.RHDA_REPORT_JSON}" to ${rhdaReportJsonFilePath}`,
        );
        expect(ghCore.setOutput).toHaveBeenCalledWith(
            Outputs.RHDA_REPORT_JSON,
            utils.escapeWindowsPathForActionsOutput(rhdaReportJsonFilePath),
        );
        expect(ghCore.info).toBeCalledWith(
            `✅ Successfully generated Red Had Dependency Analytics report`,
        );
        expect(result).toEqual({
            rhdaReportJson: rhdaReportJson,
            rhdaReportJsonFilePath: rhdaReportJsonFilePath,
        });
    });

    it('should generate the RHDA report for Docker ecosystem', async () => {
        const manifestFilePath = 'path/to/manifest';
        const rhdaReportJsonFilePath = `${process.cwd()}/report.json`;

        vi.mocked(utils.getOS).mockImplementation(() => 'linux');

        const result = await generateRHDAReport(manifestFilePath, DOCKER);

        expect(ghCore.info).toBeCalledWith(`⏳ Analysing dependencies...`);
        expect(imageAnalysis.executeDockerImageAnalysis).toHaveBeenCalledWith(
            manifestFilePath,
        );
        expect(utils.writeToFile).toHaveBeenCalledWith(
            JSON.stringify(rhdaReportJson, null, 4),
            rhdaReportJsonFilePath,
        );
        expect(ghCore.info).toBeCalledWith(
            `✍️ Setting output "${Outputs.RHDA_REPORT_JSON}" to ${rhdaReportJsonFilePath}`,
        );
        expect(ghCore.setOutput).toHaveBeenCalledWith(
            Outputs.RHDA_REPORT_JSON,
            utils.escapeWindowsPathForActionsOutput(rhdaReportJsonFilePath),
        );
        expect(ghCore.info).toBeCalledWith(
            `✅ Successfully generated Red Had Dependency Analytics report`,
        );
        expect(result).toEqual({
            rhdaReportJson: rhdaReportJson,
            rhdaReportJsonFilePath: rhdaReportJsonFilePath,
        });
    });
});
