import { Credentials, CredentialProvider } from '@aws-sdk/types';

/**
 * The panel options saved in JSON
 */
export interface PanelOptions {
  // When falsy, this should pick the default or first twinmaker datasource instance
  datasource?: string;
}

export type TMQueryEditorAwsConfig = {
  awsCredentials?: Credentials;
  credentialsProvider?: CredentialProvider;

  defaultConfig?: {
    maxRetries: number;
    httpOptions: {
      timeout: number;
      connectTimeout: number;
    };
  };

  iotTwinMaker?: {
    region: string;
    endpoint?: string;
  };
};
