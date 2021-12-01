import { mockWorkspaceId } from './utils/__mocks__';

const mockGetDataSource = jest.fn();
jest.doMock('@grafana/runtime', () => ({
  getDataSourceSrv: jest.fn().mockReturnValue({ get: mockGetDataSource }),
}));

import { TwinMakerUxSDK } from 'aws-iot-twinmaker-grafana-utils';
import { DataQuery, DataSourceApi, DataSourceJsonData } from '@grafana/data';
import { configureSdkWithDataSource, DataSourceParams } from '../sdkInit';

describe('sdkInit', () => {
  describe('configureSdkWithDataSource', () => {
    it.skip('should return undefined when no connected TwinMaker data source', async () => {
      mockGetDataSource.mockResolvedValue({} as DataSourceApi<DataQuery, DataSourceJsonData>);

      expect(await configureSdkWithDataSource(undefined)).toBeUndefined();
    });

    it.skip('should return twinmaker ux sdk when has connected TwinMaker data source', async () => {
      const mockUxSdk = new TwinMakerUxSDK();
      expect(mockUxSdk.dataModule).toBeDefined();
      jest.spyOn(mockUxSdk.awsStore, 'createAwsCombinedReducer');
      jest.spyOn(mockUxSdk.awsStore, 'subscribeAwsStoreUpdate');

      mockGetDataSource.mockResolvedValue({
        getTwinMakerUxSdk: () => mockUxSdk,
        getWorkspaceId: () => mockWorkspaceId,
        instanceSettings: {
          name: 'hello',
        },
      } as unknown as DataSourceApi<DataQuery, DataSourceJsonData>);

      const result: DataSourceParams | undefined = await configureSdkWithDataSource('twinmaker');

      expect(result?.workspaceId).toBeDefined();
      expect(result?.store).toBeDefined();
      expect(result?.twinMakerUxSdk.awsStore).toBe(mockUxSdk.awsStore);
      expect(result?.twinMakerUxSdk.awsClients).toBe(mockUxSdk.awsClients);
      expect(mockUxSdk.awsStore.createAwsCombinedReducer).toBeCalledTimes(2);
      expect(mockUxSdk.awsStore.subscribeAwsStoreUpdate).toBeCalledTimes(2);
    });
  });
});
