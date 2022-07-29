import { useEffect, useState } from 'react';
import { configureSdkWithDataSource, DataSourceParams } from 'panels/sdkInit';
import IoTTwinMaker from 'aws-sdk/clients/iottwinmaker';

export const useTwinMakerClient = (
  datasource: string | undefined
): [IoTTwinMaker | undefined, DataSourceParams | undefined] => {
  const [twinMakerClient, setTwinMakerClient] = useState<IoTTwinMaker | undefined>();
  const [dataSourceParams, setDataSourceParams] = useState<DataSourceParams | undefined>(undefined);

  useEffect(() => {
    const uid = datasource;
    const runConfigure = async () => {
      const params = await configureSdkWithDataSource(uid);
      setDataSourceParams(params);
      setTwinMakerClient(params?.twinMakerUxSdk.awsClients.iotTwinMaker());
    };
    runConfigure();
  }, [datasource]);

  return [twinMakerClient, dataSourceParams];
};
