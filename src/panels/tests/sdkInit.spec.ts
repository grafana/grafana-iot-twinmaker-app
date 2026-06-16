import { mockWorkspaceId } from './utils/__mocks__';

const mockGetDataSource = jest.fn();
jest.doMock('@grafana/runtime', () => ({
  getDataSourceSrv: jest.fn().mockReturnValue({ get: mockGetDataSource }),
}));

import { TwinMakerUxSDK } from 'aws-iot-twinmaker-grafana-utils';
import { DataSourceApi, DataSourceJsonData } from '@grafana/data';
import { DataQuery } from '@grafana/schema';
import { configureSdkWithDataSource, DataSourceParams } from '../sdkInit';
import * as commonFuncs from 'common/datasourceSrv';
import * as awsConfig from '../awsConfig';

// mock these imports
jest.mock('common/datasourceSrv', () => ({
  getTwinMakerDatasource: jest.fn(),
}));

jest.mock('../awsConfig', () => ({
  getAwsConfig: jest.fn(),
  getAwsTMQEConfig: jest.fn(),
}));

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
      expect(mockUxSdk.awsStore.createAwsCombinedReducer).toHaveBeenCalledTimes(2);
      expect(mockUxSdk.awsStore.subscribeAwsStoreUpdate).toHaveBeenCalledTimes(2);
    });

    it('should properly set endpoint on configured twinmaker datasource when endpoint is defined', async () => {
      // mocks
      jest.spyOn(TwinMakerUxSDK.prototype, 'setAwsConfig').mockImplementationOnce(() => {});
      (awsConfig.getAwsConfig as jest.Mock).mockReturnValueOnce({ iotTwinMaker: { endpoint: 'https://test' } });
      (awsConfig.getAwsTMQEConfig as jest.Mock).mockReturnValueOnce({ iotTwinMaker: { endpoint: 'https://test' } });

      // getTwinmakerDatasource with endpoint
      (commonFuncs.getTwinMakerDatasource as jest.Mock).mockReturnValueOnce({
        instanceSettings: {
          jsonData: {
            workspaceId: 1,
            endpoint: 'https://test',
          },
        },
      });
      const response = await configureSdkWithDataSource('twinmaker1');
      expect(response?.awsConfig.iotTwinMaker?.endpoint).toBe('https://test');
    });

    it('should properly set endpoint to undefined when endpoint is empty string', async () => {
      // mocks
      jest.spyOn(TwinMakerUxSDK.prototype, 'setAwsConfig').mockImplementation(() => {});
      (awsConfig.getAwsConfig as jest.Mock).mockReturnValue({ iotTwinMaker: { endpoint: '' } });
      (awsConfig.getAwsTMQEConfig as jest.Mock).mockReturnValue({ iotTwinMaker: { endpoint: '' } });

      // getTwinMakerDatasource with empty string endpoint
      (commonFuncs.getTwinMakerDatasource as jest.Mock).mockReturnValueOnce({
        instanceSettings: {
          jsonData: {
            workspaceId: 1,
            endpoint: '',
          },
        },
      });

      const response = await configureSdkWithDataSource('twinmaker2');
      expect(response?.awsConfig.iotTwinMaker?.endpoint).toBe(undefined);
    });
  });
});
