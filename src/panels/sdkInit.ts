import { AnyAction, CombinedState, createStore, Store } from 'redux';
import { TwinMakerUxSDK } from 'aws-iot-twinmaker-grafana-utils';
import { OldDatasourceStuff } from './oldStuffFromDatasource';
import { getTwinMakerDatasource } from 'common/datasourceSrv';
import { initialize } from '@iot-app-kit/source-iottwinmaker';
import { TMQueryEditorAwsConfig } from 'panels/query-editor/types';

export type DataSourceParams = {
  store: Store<CombinedState<any>, AnyAction>;
  twinMakerUxSdk: TwinMakerUxSDK;
  appKitTMDataSource: ReturnType<typeof initialize>;
  workspaceId: string;
  awsConfig: TMQueryEditorAwsConfig;
};

const cache = new Map<string, OldDatasourceStuff>();

async function getOldDatasourceStuff(uid?: string): Promise<OldDatasourceStuff | undefined> {
  if (!uid) {
    uid = '';
  }
  if (!cache.has(uid)) {
    const ds = await getTwinMakerDatasource(uid);
    if (!ds) {
      return undefined;
    }
    cache.set(uid, new OldDatasourceStuff(ds));
  }
  return cache.get(uid);
}

export async function configureSdkWithDataSource(uid?: string): Promise<DataSourceParams | undefined> {
  const twinMakerDataSource = await getOldDatasourceStuff(uid);

  if (!twinMakerDataSource || !twinMakerDataSource.getTwinMakerUxSdk) {
    return undefined;
  }

  if (
    typeof twinMakerDataSource.getTwinMakerUxSdk === 'function' &&
    twinMakerDataSource.getWorkspaceId &&
    twinMakerDataSource.getTMQEAwsConfig
  ) {
    const twinMakerUxSdk = new TwinMakerUxSDK(twinMakerDataSource.getTwinMakerUxSdk());

    const store: Store<CombinedState<any>, AnyAction> = createStore(
      twinMakerUxSdk.awsStore.createAwsCombinedReducer({})
    );
    twinMakerUxSdk.awsStore.subscribeAwsStoreUpdate(store);

    const workspaceId: string = twinMakerDataSource.getWorkspaceId();
    const awsConfig = twinMakerDataSource.getTMQEAwsConfig();

    return {
      twinMakerUxSdk,
      store,
      workspaceId,
      awsConfig,
      appKitTMDataSource: twinMakerDataSource.getAppKitTMDataSource(),
    };
  }
  console.log('TwinMaker UX SDK not found');
  return undefined;
}
