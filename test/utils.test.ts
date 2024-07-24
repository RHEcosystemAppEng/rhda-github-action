import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as ghCore from '@actions/core';
import * as ghExec from '@actions/exec';
import * as fs from 'fs';
import * as zlib from 'zlib';

import * as utils from '../src/utils';
import { Inputs } from '../src/generated/inputs-outputs';

vi.mock('@actions/core', () => ({
    warning: vi.fn(),
    getInput: vi.fn(),
    debug: vi.fn(),
}));

describe('getOS', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        utils.setCurrentOS(undefined);
    });

    function mockPlatform(platform: NodeJS.Platform) {
        Object.defineProperty(process, 'platform', {
            value: platform,
        });
    }

    it('should return cached OS if already set', () => {
        utils.setCurrentOS('macos');
        expect(utils.getOS()).toBe('macos');
    });

    it('should return "windows" for win32', () => {
        mockPlatform('win32');
        expect(utils.getOS()).toBe('windows');
    });

    it('should return "macos" for darwin', () => {
        mockPlatform('darwin');
        expect(utils.getOS()).toBe('macos');
    });

    it('should return "linux" for linux', () => {
        mockPlatform('linux');
        expect(utils.getOS()).toBe('linux');
    });

    it('should return "linux" and warn for unrecognized platforms', () => {
        mockPlatform('android');
        const os = utils.getOS();
        expect(os).toBe('linux');
        expect(ghCore.warning).toHaveBeenCalledWith(
            'Unrecognized OS "android"',
        );
    });
});

describe('getGhToken', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        utils.setGhToken(undefined);
        delete process.env.GITHUB_TOKEN;
    });

    it('should return undefined if no token is found', () => {
        expect(utils.getGhToken()).toBeUndefined();
    });

    it('should return the token from getInput', () => {
        vi.mocked(ghCore.getInput).mockReturnValueOnce('test-token');

        expect(utils.getGhToken()).toBe('test-token');
        expect(ghCore.getInput).toHaveBeenCalledWith(Inputs.GITHUB_TOKEN);
    });

    it('should return the token from process.env', () => {
        process.env.GITHUB_TOKEN = 'env-token';

        expect(utils.getGhToken()).toBe('env-token');
    });
});

describe('getGitExecutable', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        utils.setGitExecutable(undefined);
    });

    it('should return cached git executable if already set', () => {
        utils.setGitExecutable('git');
        expect(utils.getGitExecutable()).toBe('git');
    });

    it('should return "git.exe" on Windows', async () => {
        utils.setCurrentOS('windows');
        expect(utils.getGitExecutable()).toBe('git.exe');
    });

    it('should return "git" on other OS', async () => {
        utils.setCurrentOS('linux');
        expect(utils.getGitExecutable()).toBe('git');
    });
});

describe('getEnvVar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        utils.setGitExecutable(undefined);
    });

    it('should return the environment variable value', () => {
        process.env.TEST_VAR = 'testValue';
        const result = utils.getEnvVar('TEST_VAR');
        expect(result).toBe('testValue');
    });

    it('should throw an error if the environment variable is not set', () => {
        expect(() => utils.getEnvVar('UNSET_VAR')).toThrow(
            '❌ UNSET_VAR environment variable must be set',
        );
    });

    it('should throw an error if the environment variable is an empty string', () => {
        process.env.EMPTY_VAR = '';
        expect(() => utils.getEnvVar('EMPTY_VAR')).toThrow(
            '❌ EMPTY_VAR environment variable must be set',
        );
    });
});

vi.mock('fs', () => ({
    writeFileSync: vi.fn(),
    readFileSync: vi.fn(),
}));

describe('writeToFile', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should write data to the specified file path', async () => {
        const data = 'Test data';
        const path = 'test.txt';

        utils.writeToFile(data, path);

        expect(fs.writeFileSync).toHaveBeenCalledWith(path, data, 'utf-8');
    });
});

describe('escapeWindowsPathForActionsOutput', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should escape backslashes in a Windows path', () => {
        const path = 'C:\\Users\\User\\Documents';
        const expected = 'C:\\\\Users\\\\User\\\\Documents';

        const result = utils.escapeWindowsPathForActionsOutput(path);

        expect(result).toBe(expected);
    });

    it('should return the same string if no backslashes are present', () => {
        const path = '/usr/local/bin';
        const expected = '/usr/local/bin';

        const result = utils.escapeWindowsPathForActionsOutput(path);

        expect(result).toBe(expected);
    });

    it('should handle an empty string', () => {
        const path = '';
        const expected = '';

        const result = utils.escapeWindowsPathForActionsOutput(path);

        expect(result).toBe(expected);
    });
});

vi.mock('zlib', () => ({
    gzipSync: vi.fn(),
}));

describe('zipFile', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should zip the file contents and return as base64', async () => {
        const mockFile = 'test.txt';
        const mockContent = 'Hello, world!';
        const zippedContent = 'zipped content';
        const mockZipped = Buffer.from(zippedContent).toString('base64');

        vi.mocked(fs.readFileSync).mockReturnValue(mockContent);

        vi.mocked(zlib.gzipSync).mockReturnValue(Buffer.from(zippedContent));

        const result = await utils.zipFile(mockFile);

        expect(fs.readFileSync).toHaveBeenCalledWith(mockFile, 'utf-8');
        expect(zlib.gzipSync).toHaveBeenCalledWith(mockContent);
        expect(result).toBe(mockZipped);
    });
});

describe('isDefined', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return true when all keys are defined in the object (with key request)', () => {
        const obj = {
            a: {
                b: {
                    c: 10,
                },
            },
        };
        expect(utils.isDefined(obj, 'a', 'b', 'c')).toEqual(true);
    });

    it('should return true when all keys are defined in the object (without key requests)', () => {
        const obj = {
            a: {
                b: {
                    c: 10,
                },
            },
        };
        expect(utils.isDefined(obj)).toEqual(true);
    });

    it('should return false if any key is not defined in the object', () => {
        const obj = {
            a: {
                b: {
                    c: 10,
                },
            },
        };
        expect(utils.isDefined(obj, 'a', 'b', 'd')).toEqual(false);
    });

    it('should return false if the object itself is not defined', () => {
        const obj = null;
        expect(utils.isDefined(obj, 'a', 'b', 'c')).toEqual(false);
    });

    it('should return false if any intermediate key in the object chain is not defined', () => {
        const obj = {
            a: {
                b: null,
            },
        };
        expect(utils.isDefined(obj, 'a', 'b', 'c')).toEqual(false);
    });

    it('should return false if any intermediate key in the object chain is undefined', () => {
        const obj = {
            a: {
                b: undefined,
            },
        };
        expect(utils.isDefined(obj, 'a', 'b', 'c')).toEqual(false);
    });
});

vi.mock('@actions/exec', () => ({
    exec: vi.fn(),
}));

describe('execCommand', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should execute a command and return the result', async () => {
        const mockExecutable = 'echo';
        const mockArgs = ['hello'];
        const mockOptions = {};

        const mockExitCode = 0;
        const mockStdout = 'hello\n';
        const mockStderr = '';
        vi.mocked(ghExec.exec).mockImplementation(
            (
                commandLine: string,
                args?: string[] | undefined,
                options?: ghExec.ExecOptions | undefined,
            ) => {
                options?.listeners?.stdout!(Buffer.from(mockStdout));
                options?.listeners?.stderr!(Buffer.from(mockStderr));
                return Promise.resolve(mockExitCode);
            },
        );

        const result = await utils.execCommand(
            mockExecutable,
            mockArgs,
            mockOptions,
        );

        expect(result).toEqual({
            exitCode: mockExitCode,
            stdout: mockStdout,
            stderr: mockStderr,
        });
    });
});

describe('getCommitSha', () => {
    it('should return the commit SHA', async () => {
        const mockSha = 'abc123';
        const mockExitCode = 0;
        const mockStdout = `${mockSha}\n`;
        const mockStderr = '';
        vi.mocked(ghExec.exec).mockImplementation(
            (
                commandLine: string,
                args?: string[] | undefined,
                options?: ghExec.ExecOptions | undefined,
            ) => {
                options?.listeners?.stdout!(Buffer.from(mockStdout));
                options?.listeners?.stderr!(Buffer.from(mockStderr));
                return Promise.resolve(mockExitCode);
            },
        );

        const result = await utils.getCommitSha();

        expect(result).toBe(mockSha);
    });
});
