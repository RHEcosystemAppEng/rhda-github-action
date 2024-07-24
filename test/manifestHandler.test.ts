import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as ghCore from '@actions/core';
import path from 'path';
import { Dirent, promises as fs } from 'fs';

import { resolveManifestFilePath } from '../src/manifestHandler';
import { Inputs } from '../src/generated/inputs-outputs';
import { fileNameToEcosystemMappings } from '../src/constants';

vi.mock('@actions/core', () => ({
    getInput: vi.fn(),
    info: vi.fn(),
}));

vi.mock('fs', () => ({
    promises: {
        readdir: vi.fn().mockResolvedValue(['package.json']),
    },
}));

describe('resolveManifestFilePath', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should resolve manifest file path from provided MANIFEST_DIRECTORY and MANIFEST_FILE input', async () => {
        vi.mocked(ghCore.getInput).mockImplementation((name) => {
            if (name === Inputs.MANIFEST_DIRECTORY) {
                return 'manifests/npm';
            }
            if (name === Inputs.MANIFEST_FILE) {
                return 'package.json';
            }
            return '';
        });

        const expectedResolvedManifestPath = path.join(
            path.resolve('manifests/npm'),
            'package.json',
        );

        const result = await resolveManifestFilePath();

        expect(ghCore.info).toHaveBeenCalledWith(
            `ℹ️ Manifest file path is "${expectedResolvedManifestPath}"`,
        );
        expect(result).toEqual({
            manifestFilePath: expectedResolvedManifestPath,
            ecosystem: fileNameToEcosystemMappings['package.json'],
        });
    });

    it('should use default directory when MANIFEST_DIRECTORY input is not provided', async () => {
        vi.mocked(ghCore.getInput).mockImplementation((name) => {
            if (name === Inputs.MANIFEST_DIRECTORY) {
                return '';
            }
            if (name === Inputs.MANIFEST_FILE) {
                return 'package.json';
            }
            return '';
        });

        const result = await resolveManifestFilePath();

        expect(ghCore.info).toHaveBeenCalledWith(
            `"${Inputs.MANIFEST_DIRECTORY}" not provided. Using working directory "${process.cwd()}"`,
        );
        expect(result).toEqual({
            manifestFilePath: path.join(process.cwd(), 'package.json'),
            ecosystem: fileNameToEcosystemMappings['package.json'],
        });
    });

    it('should throw error if provided manifest file is not supported', async () => {
        vi.mocked(ghCore.getInput).mockImplementation((name) => {
            if (name === Inputs.MANIFEST_DIRECTORY) {
                return '';
            }
            if (name === Inputs.MANIFEST_FILE) {
                return 'unsupported.json';
            }
            return '';
        });

        await expect(resolveManifestFilePath()).rejects.toThrow(
            'File "unsupported.json" is not supported!!',
        );
    });

    it('should auto-detect manifest file if MANIFEST_FILE input is not provided', async () => {
        vi.mocked(ghCore.getInput).mockImplementation((name) => {
            if (name === Inputs.MANIFEST_DIRECTORY) {
                return '';
            }
            if (name === Inputs.MANIFEST_FILE) {
                return '';
            }
            return '';
        });

        const result = await resolveManifestFilePath();

        expect(ghCore.info).toHaveBeenCalledTimes(4);
        expect(ghCore.info).toHaveBeenNthCalledWith(
            1,
            `"${Inputs.MANIFEST_DIRECTORY}" not provided. Using working directory "${process.cwd()}"`,
        );
        expect(ghCore.info).toHaveBeenNthCalledWith(
            2,
            `"${Inputs.MANIFEST_FILE}" input not provided. Auto-detecting manifest file`,
        );
        expect(ghCore.info).toHaveBeenNthCalledWith(
            3,
            `🔍 Looking for manifest in "${process.cwd()}"...`,
        );
        expect(ghCore.info).toHaveBeenNthCalledWith(
            4,
            `ℹ️ Manifest file path is "${path.join(process.cwd(), 'package.json')}"`,
        );
        expect(result).toEqual({
            manifestFilePath: path.join(process.cwd(), 'package.json'),
            ecosystem: fileNameToEcosystemMappings['package.json'],
        });
    });

    it('should throw error if no valid manifest file is found during auto-detection', async () => {
        vi.mocked(ghCore.getInput).mockImplementation((name) => {
            if (name === Inputs.MANIFEST_DIRECTORY) {
                return '';
            }
            if (name === Inputs.MANIFEST_FILE) {
                return '';
            }
            return '';
        });

        vi.mocked(fs.readdir).mockResolvedValue([
            'invalid.json',
        ] as unknown as Dirent[]);

        await expect(resolveManifestFilePath()).rejects.toThrow(
            `Failed to find a manifest file in "${process.cwd()}" matching one of the expected project types. Expected to find one of: ${Object.keys(fileNameToEcosystemMappings).join(', ')}`,
        );
    });
});
