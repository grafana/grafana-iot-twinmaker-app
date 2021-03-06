import { AnyAction, CombinedState, createStore, Store } from 'redux';
import { TwinMakerUxSDK } from 'aws-iot-twinmaker-grafana-utils';
import { OldDatasourceStuff } from './oldStuffFromDatasource';
import { getTwinMakerDatasource } from 'common/datasourceSrv';

export type DataSourceParams = {
  store: Store<CombinedState<any>, AnyAction>;
  twinMakerUxSdk: TwinMakerUxSDK;
  workspaceId: string;
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

  if (typeof twinMakerDataSource.getTwinMakerUxSdk === 'function' && twinMakerDataSource.getWorkspaceId) {
    const twinMakerUxSdk = new TwinMakerUxSDK(twinMakerDataSource.getTwinMakerUxSdk());

    const store: Store<CombinedState<any>, AnyAction> = createStore(
      twinMakerUxSdk.awsStore.createAwsCombinedReducer({})
    );
    twinMakerUxSdk.awsStore.subscribeAwsStoreUpdate(store);

    const workspaceId: string = twinMakerDataSource.getWorkspaceId();

    return { twinMakerUxSdk, store, workspaceId };
  }
  console.log('TwinMaker UX SDK not found');
  return undefined;
}
