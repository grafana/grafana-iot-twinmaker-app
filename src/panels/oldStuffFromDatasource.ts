import { TwinMakerUxSDK } from 'aws-iot-twinmaker-grafana-utils';
import { TwinMakerDataSource } from 'datasource/datasource';
import { defaultRegion, getAwsConfig, getAwsTMQEConfig } from './awsConfig';
import { initialize } from '@iot-app-kit/source-iottwinmaker';
import { TMQueryEditorAwsConfig } from 'panels/query-editor/types';

/**
 * The initialization process needs revisited here.  This simply moves things from
 * The Datasource into this temporary file.
 */
export class OldDatasourceStuff {
  private twinMakerUxSDK = new TwinMakerUxSDK();
  private appKitTMDataSource: ReturnType<typeof initialize>;
  private workspaceId: string;
  private awsTMQEConfig: TMQueryEditorAwsConfig;

  constructor(ds: TwinMakerDataSource) {
    this.workspaceId = ds.instanceSettings.jsonData.workspaceId!;

    const awsConfig = getAwsConfig(ds.getTokens, ds.getTokensV3, ds.instanceSettings.jsonData.defaultRegion);
    this.awsTMQEConfig = getAwsTMQEConfig(ds.getTokensV3, ds.instanceSettings.jsonData.defaultRegion);
    const endpoint = ds.instanceSettings.jsonData.endpoint || undefined; // if endpoint is empty string, prefer undefined
    if ((endpoint || endpoint === undefined) && awsConfig.iotTwinMaker && this.awsTMQEConfig.iotTwinMaker) {
      awsConfig.iotTwinMaker.endpoint = endpoint;
      this.awsTMQEConfig.iotTwinMaker.endpoint = endpoint;
    }
    this.twinMakerUxSDK.setAwsConfig(awsConfig);

    this.appKitTMDataSource = initialize(this.workspaceId, {
      awsCredentials: ds.getTokensV3,
      awsRegion: ds.instanceSettings.jsonData.defaultRegion || defaultRegion,
      tmEndpoint: endpoint,
    });
  }

  getWorkspaceId() {
    return this.workspaceId;
  }

  getTwinMakerUxSdk() {
    return this.twinMakerUxSDK;
  }

  getAppKitTMDataSource() {
    return this.appKitTMDataSource;
  }

  getTMQEAwsConfig() {
    return this.awsTMQEConfig;
  }
}
