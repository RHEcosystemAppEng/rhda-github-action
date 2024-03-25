import * as ghCore from '@actions/core';

import { stackAnalysisService } from './exhortServices.js';
import { Inputs, Outputs } from './generated/inputs-outputs.js';
import * as constants from './constants.js';

function getRHDAConfig() {
     // set up configuration options for the stack analysis request
     const options = {
        // 'RHDA_TOKEN': globalConfig.telemetryId,
        'RHDA_SOURCE': constants.UTM_SOURCE,
        'MATCH_MANIFEST_VERSIONS': ghCore.getInput(Inputs.MATCH_MANIFEST_VERSION),
        'EXHORT_PYTHON_VIRTUAL_ENV': ghCore.getInput(Inputs.SET_PYTHON_VIRTUAL_ENVIRONMENT),
        'EXHORT_MVN_PATH': ghCore.getInput(Inputs.MVN_EXECUTABLE_PATH),
        'EXHORT_NPM_PATH': ghCore.getInput(Inputs.NPM_EXECUTABLE_PATH),
        'EXHORT_GO_PATH': ghCore.getInput(Inputs.GO_EXECUTABLE_PATH),
        'EXHORT_PYTHON3_PATH': ghCore.getInput(Inputs.PYTHON3_EXECUTABLE_PATH),
        'EXHORT_PIP3_PATH': ghCore.getInput(Inputs.PIP3_EXECUTABLE_PATH),
        'EXHORT_PYTHON_PATH': ghCore.getInput(Inputs.PYTHON_EXECUTABLE_PATH),
        'EXHORT_PIP_PATH': ghCore.getInput(Inputs.PIP_EXECUTABLE_PATH),
    };

    const snykToken = ghCore.getInput(Inputs.SNYK_TOKEN);
    if (snykToken !== '') {
        options['EXHORT_SNYK_TOKEN'] = snykToken;
    }

    return options;
}

export async function generateRHDAReport(manifestFilePath: string) {
      try {
        const rhdaReportJson = await stackAnalysisService(manifestFilePath, getRHDAConfig())
        return JSON.parse(JSON.stringify(rhdaReportJson));
      } catch (error) {
        throw (error);
      }
  }
  