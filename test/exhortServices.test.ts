import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execSync } from 'child_process';
import exhort from '@rhecosystemappeng/exhort-javascript-api';

import { UTM_SOURCE } from '../src/constants';
import {
    imageAnalysisService,
    stackAnalysisService,
} from '../src/exhortServices';

vi.mock('child_process', () => ({
    execSync: vi.fn(),
}));

vi.mock('@rhecosystemappeng/exhort-javascript-api', async (importOriginal) => {
    const actual: any = await importOriginal();
    return {
        ...actual,
        default: {
            ...actual.default,
            stackAnalysis: vi.fn(),
        },
    };
});

describe('imageAnalysisService', () => {
    const options = {
        RHDA_SOURCE: UTM_SOURCE,
        EXHORT_SYFT_PATH: '/path/to/syft',
        EXHORT_SYFT_CONFIG_PATH: '/path/to/syft_config',
        EXHORT_SKOPEO_PATH: '/path/to/skopeo',
        EXHORT_SKOPEO_CONFIG_PATH: '/path/to/skopeo_config',
        EXHORT_DOCKER_PATH: '/path/to/docker',
        EXHORT_PODMAN_PATH: '/path/to/podman',
        EXHORT_IMAGE_PLATFORM: 'platform',
    };
    const images = [
        { image: 'image1', platform: 'platform1' },
        { image: 'image2', platform: '' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should execute image analysis and return HTML result', async () => {
        const mockExecSyncResult = 'Mock HTML result';
        vi.mocked(execSync).mockReturnValue(mockExecSyncResult);

        const result = await imageAnalysisService(images, options);

        const expectedJarPath = `${process.cwd()}/javaApiAdapter/exhort-java-api-adapter-1.0-SNAPSHOT-jar-with-dependencies.jar`;
        const expectedCommand = `java -DRHDA_SOURCE=github-actions -DEXHORT_SYFT_PATH=/path/to/syft -DEXHORT_SYFT_CONFIG_PATH=/path/to/syft_config -DEXHORT_SKOPEO_PATH=/path/to/skopeo -DEXHORT_SKOPEO_CONFIG_PATH=/path/to/skopeo_config -DEXHORT_DOCKER_PATH=/path/to/docker -DEXHORT_PODMAN_PATH=/path/to/podman -DEXHORT_IMAGE_PLATFORM=platform -jar ${expectedJarPath} json image1^^platform1 image2`;
        expect(execSync).toHaveBeenCalledWith(expectedCommand, {
            maxBuffer: 1000 * 1000 * 10,
        });

        expect(result).toBe(mockExecSyncResult);
    });

    it('should reject with error when image analysis execution fails', async () => {
        const errorMessage = 'Image analysis execution failed';
        vi.mocked(execSync).mockImplementation(() => {
            throw new Error(errorMessage);
        });

        await expect(imageAnalysisService(images, options)).rejects.toThrow(
            errorMessage,
        );
    });
});

describe('stackAnalysisService', () => {
    const mockPathToManifest = 'path/to/manifest';
    const mockOptions = { someOption: 'someValue' };
    const mockReport: exhort.AnalysisReport = {
        analysis: 'report',
    } as exhort.AnalysisReport;
    const mockError: Error = new Error('Analysis failed');

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return the stack analysis report in JSON format', async () => {
        vi.mocked(exhort.stackAnalysis).mockResolvedValue(mockReport);

        const result = await stackAnalysisService(
            mockPathToManifest,
            mockOptions,
        );

        expect(result).toEqual(mockReport);
        expect(exhort.stackAnalysis).toHaveBeenCalledWith(
            mockPathToManifest,
            false,
            mockOptions,
        );
    });

    it('should throw an error if the stack analysis fails', async () => {
        vi.mocked(exhort.stackAnalysis).mockRejectedValue(mockError);

        await expect(
            stackAnalysisService(mockPathToManifest, mockOptions),
        ).rejects.toThrow(mockError);

        expect(exhort.stackAnalysis).toHaveBeenCalledWith(
            mockPathToManifest,
            false,
            mockOptions,
        );
    });
});
