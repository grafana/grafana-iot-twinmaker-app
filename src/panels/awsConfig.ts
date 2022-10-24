import { UxSDKAwsConfig } from 'aws-iot-twinmaker-grafana-utils';
import { Credentials } from 'aws-sdk/global';
import { CredentialProvider } from '@aws-sdk/types';

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
