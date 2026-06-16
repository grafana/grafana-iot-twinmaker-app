import { SelectableValue } from '@grafana/data';
import { getDataSourceSrv } from '@grafana/runtime';
import { TwinMakerDataSource } from 'datasource/datasource';
import { TWINMAKER_DATASOURCE_ID } from './constants';

/** List panel options */
export function getTwinMakerDatasourcePicker(): Array<SelectableValue<string>> {
  const options: Array<SelectableValue<string>> = [];
  const info = getDataSourceSrv()
    .getList()
    .filter((ds) => {
      return ds.type === TWINMAKER_DATASOURCE_ID;
    });

  if (!info.length) {
    options.push({ value: '', label: 'Default (none found)', description: 'No twinmaker datasource configured' });
    return options;
  }

  let defaultTwinMakerDS = info[0];
  for (const ds of info) {
    if (ds.isDefault) {
      defaultTwinMakerDS = ds;
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let workspaceId = (defaultTwinMakerDS.jsonData as any)?.workspaceId;
  options.push({ value: '', label: `Default (${defaultTwinMakerDS.name} / ${workspaceId})` });
  for (const ds of info) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    workspaceId = (ds.jsonData as any)?.workspaceId;
    const v: SelectableValue<string> = {
      value: ds.uid,
      label: ds.name,
    };
    if (!workspaceId) {
      v.icon = 'exclamation-triangle';
      v.description = 'Missing workspace id';
    } else {
      v.label += ` (${workspaceId})`;
    }
    options.push(v);
  }

  return options;
}

const cache = new Map<string, TwinMakerDataSource>();

/** Get the datasource instance -- prefer default values */
export async function getTwinMakerDatasource(uid?: string): Promise<TwinMakerDataSource | undefined> {
  const key = uid ?? '';
  let ds = cache.get(key);
  if (ds) {
    return Promise.resolve(ds);
  }
  // Find the default one
  if (!key) {
    const info = getDataSourceSrv().getList({
      type: TWINMAKER_DATASOURCE_ID,
    });
    if (!info.length) {
      return Promise.resolve(undefined);
    }
    uid = info[0].uid;
    for (const ds of info) {
      if (ds.isDefault) {
        uid = ds.uid;
        break;
      }
    }
  }

  try {
    ds = (await getDataSourceSrv().get(uid)) as TwinMakerDataSource;
    if (ds) {
      cache.set(key, ds);
    }
  } catch (ex) {
    console.log('ERROR loading datasource!!!', ex, uid);
  }
  return ds;
}
