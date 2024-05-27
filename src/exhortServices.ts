import exhort from '@rhecosystemappeng/exhort-javascript-api';

/**
 * Performs RHDA stack analysis based on the provided manifest path and options.
 * @param pathToManifest The path to the manifest file for analysis.
 * @param options Additional options for the analysis.
 * @returns A promise resolving to the stack analysis report in HTML format.
 */
async function stackAnalysisService(pathToManifest, options): Promise<string | exhort.AnalysisReport> {
    try {
      // Get stack analysis in JSON format
      const stackAnalysisReportJson = await exhort.stackAnalysis(pathToManifest, false, options);
      return stackAnalysisReportJson;
    } catch (error) {
      throw error;
    }
}

export { stackAnalysisService };