import exhort from '@rhecosystemappeng/exhort-javascript-api';
import { execSync } from 'child_process';

import { IImageRef, IOptions } from './imageAnalysis.js';

/**
 * Executes RHDA image analysis using the provided images and options.
 * @param images - The images to analyze.
 * @param options - The options for running image analysis.
 * @returns A Promise resolving to the analysis response in JSON format.
 */
function imageAnalysisService(
    images: IImageRef[],
    options: IOptions,
): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
        const jarPath = `${process.cwd()}/javaApiAdapter/exhort-java-api-adapter-1.0-SNAPSHOT-jar-with-dependencies.jar`;
        const reportType = 'json';
        let parameters = '';
        let properties = '';

        images.forEach((image) => {
            if (image.platform) {
                parameters += ` ${image.image}^^${image.platform}`;
            } else {
                parameters += ` ${image.image}`;
            }
        });

        for (const setting in options) {
            if (options[setting]) {
                properties += ` -D${setting}=${options[setting]}`;
            }
        }
        try {
            const result = execSync(
                `java${properties} -jar ${jarPath} ${reportType}${parameters}`,
                {
                    maxBuffer: 1000 * 1000 * 10, // 10 MB
                },
            );
            resolve(result.toString());
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Performs RHDA stack analysis based on the provided manifest path and options.
 * @param pathToManifest The path to the manifest file for analysis.
 * @param options Additional options for the analysis.
 * @returns A promise resolving to the stack analysis report in JSON format.
 */
async function stackAnalysisService(
    pathToManifest,
    options,
): Promise<string | exhort.AnalysisReport> {
    try {
        // Get stack analysis in JSON format
        const stackAnalysisReportJson = await exhort.stackAnalysis(
            pathToManifest,
            false,
            options,
        );
        return stackAnalysisReportJson;
    } catch (error) {
        throw error;
    }
}

export { stackAnalysisService, imageAnalysisService };
