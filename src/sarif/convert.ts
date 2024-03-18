import * as ghCore from '@actions/core';
import * as sarif from "sarif";
import * as fs from "fs";
import path from 'path';

import * as result from './results.js';
import * as types from './types.js';
import { SARIF_SCHEMA_URL, SARIF_SCHEMA_VERSION } from '../constants.js';

function rhdaJsonToSarif(rhdaData: types.RhdaData, manifestFilePath: string) {
    /*
    * creates results and rules and structures SARIF
    */

    let finalResults: sarif.Result[] = [];
    let finalRules: sarif.ReportingDescriptor[] = [];

    Object.entries(rhdaData.providers).map(([provider, providerData]: [string, types.RhdaProvider]) => {
        if (provider !== 'trusted-content')(
            Object.entries(providerData.sources).forEach(([source, sourceData]: [string, types.RhdaSource]) => {
                sourceData.dependencies.forEach(
                (dependency: types.RhdaDependency) => {
                    const res = result.rhdaToResult(dependency, manifestFilePath);
                    finalResults.push(...res[0]);
                    finalRules.push(...res[1]);
                });
            })
        );
    });

    ghCore.debug(`Number of results: ${finalResults.length}`);

    // const finalRules = crdaToRules(crdaData.severity, tranVulRuleIdsWithDepName);
    ghCore.debug(`Number of rules: ${finalRules.length}`);

    ghCore.debug(`Sarif schema version is ${SARIF_SCHEMA_VERSION}`);

    return {
        $schema: SARIF_SCHEMA_URL,
        version: SARIF_SCHEMA_VERSION,
        runs: [
            {
                tool: {
                    driver: {
                        name: "Red Hat Dependency Analytics",
                        rules: finalRules,
                    },
                },
                results: finalResults,
            },
        ],
    };
}

export async function generateSarif(rhdaReportJson: any, manifestFilePath: string): Promise<string> {
    /*
    * creates a SARIF and writes it to file
    */

    const convertedSarif = rhdaJsonToSarif(rhdaReportJson, manifestFilePath);

    if (!convertedSarif.$schema) {
        throw new Error(`No $schema key for SARIF file, cannot proceed.`);
    }

    const jsonExt = path.extname(path.join('.','redhat-dependency-analytics-report.json'));
    const jsonBasename = path.basename(path.join('.','redhat-dependency-analytics-report.json'));

    const sarifBasename = jsonBasename.replace(jsonExt, ".sarif");
    // eg crda_analysis_report.json -> crda_analysis_report.sarif
    const sarifPath = path.resolve(".", sarifBasename);

    await fs.writeFileSync(sarifPath, JSON.stringify(convertedSarif, undefined, 4), "utf-8");

    return sarifPath;
}