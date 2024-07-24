import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';

import {
    executeDockerImageAnalysis,
    DockerImageAnalysis,
} from '../src/imageAnalysis';
import * as exhortServices from '../src/exhortServices';

vi.mock('fs', () => ({
    readFileSync: vi.fn(),
}));

vi.mock('../src/exhortServices', () => ({
    imageAnalysisService: vi.fn(),
}));

describe('executeDockerImageAnalysis', () => {
    const mockFileContent =
        'ARG TEST_ARG1=node\nARG TEST_ARG2=14\nFROM ${TEST_ARG1}:$TEST_ARG2\nFROM --platform=linux python:3.8 as app\nFROM scratch\n# hello world';
    const filePath = '/mock/path/to/Dockerfile';

    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(fs.readFileSync).mockReturnValue(mockFileContent);
    });

    it('should execute Docker image analysis and return JSON report', async () => {
        const mockImageAnalysisResult = {
            report: 'Example Image Analysis report',
        };

        vi.mocked(exhortServices.imageAnalysisService).mockResolvedValue(
            JSON.stringify(mockImageAnalysisResult),
        );

        const result = await executeDockerImageAnalysis(filePath);

        expect(result).toEqual(mockImageAnalysisResult);
    });

    it('should parse Dockerfile correctly and collect images', () => {
        const dockerImageAnalysis = new DockerImageAnalysis(filePath);
        const lines = dockerImageAnalysis.parseTxtDoc(filePath);
        const images = dockerImageAnalysis.collectImages(lines);

        expect(lines).toEqual(mockFileContent.split('\n'));
        expect(images).toEqual([
            { image: 'node:14', platform: '' },
            { image: 'python:3.8', platform: 'linux' },
        ]);
    });
});
