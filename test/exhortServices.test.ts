import { describe, it, expect, vi } from 'vitest';
import { execSync } from 'child_process';

import { UTM_SOURCE } from '../src/constants';
import { imageAnalysisService } from '../src/exhortServices';

vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

describe('imageAnalysisService', () => {
    const options = {
        // RHDA_TOKEN: string;
        RHDA_SOURCE: UTM_SOURCE,
        EXHORT_SYFT_PATH: '/path/to/syft',
        EXHORT_SYFT_CONFIG_PATH: '/path/to/syft_config',
        EXHORT_SKOPEO_PATH: '/path/to/skopeo',
        EXHORT_SKOPEO_CONFIG_PATH: '/path/to/skopeo_config',
        EXHORT_DOCKER_PATH: '/path/to/docker',
        EXHORT_PODMAN_PATH: '/path/to/podman',
        EXHORT_IMAGE_PLATFORM: 'platform',
    };
    const images = [{ image: 'image1', platform: 'platform1' }];

    it('should execute image analysis and return HTML result', async () => {
        const mockExecSyncResult = 'Mock HTML result';
        vi.mocked(execSync).mockReturnValue(mockExecSyncResult);

        const result = await imageAnalysisService(images, options);

        const expectedJarPath = `${process.cwd()}/javaApiAdapter/exhort-java-api-adapter-1.0-SNAPSHOT-jar-with-dependencies.jar`;
        const expectedCommand = `java -DRHDA_SOURCE=github-actions -DEXHORT_SYFT_PATH=/path/to/syft -DEXHORT_SYFT_CONFIG_PATH=/path/to/syft_config -DEXHORT_SKOPEO_PATH=/path/to/skopeo -DEXHORT_SKOPEO_CONFIG_PATH=/path/to/skopeo_config -DEXHORT_DOCKER_PATH=/path/to/docker -DEXHORT_PODMAN_PATH=/path/to/podman -DEXHORT_IMAGE_PLATFORM=platform -jar ${expectedJarPath} json image1^^platform1`;
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

        await expect(imageAnalysisService(images, options)).rejects.toThrow(errorMessage);
    });
});

// TODO: stackAnalysisService Unit Test