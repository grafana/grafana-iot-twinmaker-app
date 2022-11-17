import { UxSDKAwsConfig } from 'aws-iot-twinmaker-grafana-utils';
import { Credentials } from 'aws-sdk/global';
import { CredentialProvider } from '@aws-sdk/types';
import { TMQueryEditorAwsConfig } from 'panels/query-editor/types';

export const defaultRegion = 'us-east-1';

export const getAwsConfig = (
  credentialsProvider: () => Promise<Credentials>,
  credentialsProviderV3: CredentialProvider,
  updatedRegion?: string
): UxSDKAwsConfig => {
  const region = updatedRegion ? updatedRegion : defaultRegion;
  return {
    credentialsProvider,
    credentialsProviderV3,
    iotTwinMaker: {
      region,
    },
    s3: {
      config: {
        region,
      },
    },
    kinesisVideo: {
      config: {
        region,
      },
    },
    siteWise: {
      config: {
        region,
      },
    },
    iotTwinMakerV3: {
      region,
    },
    s3V3: {
      config: {
        region,
      },
    },
    kinesisVideoV3: {
      config: {
        region,
      },
    },
    siteWiseV3: {
      config: {
        region,
      },
    },
  };
};

export const getAwsTMQEConfig = (
  credentialsProvider: CredentialProvider,
  updatedRegion?: string
): TMQueryEditorAwsConfig => {
  const region = updatedRegion ? updatedRegion : defaultRegion;
  return {
    credentialsProvider,
    iotTwinMaker: {
      region,
    },
  };
};
