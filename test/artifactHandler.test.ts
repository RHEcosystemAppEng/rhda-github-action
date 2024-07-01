import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as ghCore from '@actions/core';

import { generateArtifacts } from '../src/artifactHandler';
import { Outputs } from '../src/generated/inputs-outputs';

vi.mock('@actions/core', () => ({
  getInput: vi.fn(),
  getBooleanInput: vi.fn(),
  info: vi.fn(),
  setOutput: vi.fn(),
}));

vi.mock('@actions/artifact', () => ({
  DefaultArtifactClient: vi.fn().mockImplementation(() => ({
    uploadArtifact: vi.fn().mockResolvedValue({ id: 123 }),
  })),
}));

describe('generateArtifacts', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should upload artifacts when UPLOAD_ARTIFACT input is true', async () => {
        vi.mocked(ghCore.getBooleanInput).mockReturnValue(true);
        vi.mocked(ghCore.getInput).mockReturnValueOnce('artifactName');

        const files = ['file1.json', 'file2.json'];

        await generateArtifacts(files);

        expect(ghCore.info).toHaveBeenCalledTimes(3);
        expect(ghCore.info).toHaveBeenCalledWith(
        '⏳ Uploading JSON and SARIF files as artifacts...'
        );
        expect(ghCore.info).toHaveBeenCalledWith(
        `✅ Successfully uploaded files: ${files}`
        );
        expect(ghCore.info).toHaveBeenCalledWith(
        `✍️ Setting artifact "artifactName" ID output "${Outputs.ARTIFACT_ID}" to 123`
        );
        expect(ghCore.setOutput).toHaveBeenCalledWith(
        Outputs.ARTIFACT_ID,
        123
        );
    });

    it('should not upload artifacts when UPLOAD_ARTIFACT input is false', async () => {
        vi.mocked(ghCore.getBooleanInput).mockReturnValue(false);

        const files = ['file1.json', 'file2.json'];

        await generateArtifacts(files);

        expect(ghCore.info).toHaveBeenCalledTimes(0);
        expect(ghCore.setOutput).not.toHaveBeenCalled();
    });
});
