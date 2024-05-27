import * as ghCore from '@actions/core';
import * as path from "path";
import { DefaultArtifactClient } from '@actions/artifact'

import { Inputs, Outputs } from './generated/inputs-outputs.js';

const artifact = new DefaultArtifactClient()

async function uploadArtifacts(artifactName: string, files: string[]): Promise<number> {   
    
    const rootDirectory = path.dirname(files[0]);

    const uploadedArtifact = await artifact.uploadArtifact(artifactName, files, rootDirectory, {});

    return uploadedArtifact.id;
}

export async function generateArtifacts(files: string[]) {

    const uploadArtifact = ghCore.getBooleanInput(Inputs.UPLOAD_ARTIFACT);
    const artifactName = ghCore.getInput(Inputs.ARTIFACT_FILENAME);
    let uploadedArtifactId: number = null;
    
    if (uploadArtifact) {
        ghCore.info(`⏳ Uploading JSON and SARIF files as artifacts...`);
        
        uploadedArtifactId = await uploadArtifacts(artifactName, files);
        
        ghCore.info(`✅ Successfully uploaded files: ${files}`);
        ghCore.info(`✍️ Setting artifact "${artifactName}" ID output "${Outputs.ARTIFACT_ID}" to ${uploadedArtifactId}`);
        ghCore.setOutput(Outputs.ARTIFACT_ID, uploadedArtifactId);
    }

}
