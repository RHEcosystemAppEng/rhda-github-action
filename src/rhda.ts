import * as ghCore from '@actions/core';

import { stackAnalysisService } from './exhortServices.js';
import { Inputs } from './generated/inputs-outputs.js';
import * as constants from './constants.js';

function getRHDAConfig() {
    // set up configuration options for the stack analysis request
    const options = {
      // 'RHDA_TOKEN': globalConfig.telemetryId,
      'RHDA_SOURCE': constants.UTM_SOURCE,
      'MATCH_MANIFEST_VERSIONS': ghCore.getInput(Inputs.MATCH_MANIFEST_VERSION),
      'EXHORT_PYTHON_VIRTUAL_ENV': ghCore.getInput(Inputs.USE_PYTHON_VIRTUAL_ENVIRONMENT),
      'EXHORT_PYTHON_INSTALL_BEST_EFFORTS': ghCore.getInput(Inputs.ENABLE_PYTHON_BEST_EFFORTS_INSTALLATION),
      'EXHORT_GO_MVS_LOGIC_ENABLED': ghCore.getInput(Inputs.USE_GO_MVS),
      'EXHORT_PIP_USE_DEP_TREE': ghCore.getInput(Inputs.USE_PIP_DEP_TREE),
      'EXHORT_MVN_PATH': ghCore.getInput(Inputs.MVN_EXECUTABLE_PATH),
      'EXHORT_GRADLE_PATH': ghCore.getInput(Inputs.GRADLE_EXECUTABLE_PATH),
      'EXHORT_NPM_PATH': ghCore.getInput(Inputs.NPM_EXECUTABLE_PATH),
      'EXHORT_GO_PATH': ghCore.getInput(Inputs.GO_EXECUTABLE_PATH),
      'EXHORT_PYTHON3_PATH': ghCore.getInput(Inputs.PYTHON3_EXECUTABLE_PATH),
      'EXHORT_PIP3_PATH': ghCore.getInput(Inputs.PIP3_EXECUTABLE_PATH),
      'EXHORT_PYTHON_PATH': ghCore.getInput(Inputs.PYTHON_EXECUTABLE_PATH),
      'EXHORT_PIP_PATH': ghCore.getInput(Inputs.PIP_EXECUTABLE_PATH),
  };

  return options;
}

export async function generateRHDAReport(manifestFilePath: string) {
  ghCore.info(`⏳ Analysing dependencies...`);
  const rhdaReportJson = await stackAnalysisService(manifestFilePath, getRHDAConfig())
  
  ghCore.info(`✅ Successfully generated Red Had Dependency Analytics report`);
  return JSON.parse(JSON.stringify(rhdaReportJson));
}
  