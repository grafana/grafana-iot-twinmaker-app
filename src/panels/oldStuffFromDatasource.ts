import { TwinMakerUxSDK } from 'aws-iot-twinmaker-grafana-utils';
import { TwinMakerDataSource } from 'datasource/datasource';
import { getAwsConfig } from './awsConfig';

/**
 * The initalization process needs revisited here.  This simply moves things from
 * The Datasource into this temporary file.
 */
export class OldDatasourceStuff {
  private twinMakerUxSDK = new TwinMakerUxSDK();
  private workspaceId: string;

  constructor(ds: TwinMakerDataSource) {
    this.workspaceId = ds.instanceSettings.jsonData.workspaceId!;

    const awsConfig = getAwsConfig(ds.getTokens, ds.getTokensV3, ds.instanceSettings.jsonData.defaultRegion);
    const endpoint = ds.instanceSettings.jsonData.endpoint;
    if (endpoint && awsConfig.iotTwinMaker) {
      awsConfig.iotTwinMaker.endpoint = endpoint;
    }
    this.twinMakerUxSDK.setAwsConfig(awsConfig);
  }

  getWorkspaceId() {
    return this.workspaceId;
  }

  getTwinMakerUxSdk() {
    return this.twinMakerUxSDK;
  }
}
