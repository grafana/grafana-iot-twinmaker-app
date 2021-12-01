import { UxSDKAwsConfig } from 'aws-iot-twinmaker-grafana-utils';
import { Credentials } from 'aws-sdk/global';

const defaultRegion = 'us-east-1';

export const getAwsConfig = (
  credentialsProvider: () => Promise<Credentials>,
  updatedRegion?: string
): UxSDKAwsConfig => {
  const region = updatedRegion ? updatedRegion : defaultRegion;
  return {
    credentialsProvider,
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
  };
};
