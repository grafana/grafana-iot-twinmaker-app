import { SelectableValue } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { TwinMakerWorkspaceInfoSupplier, WorkspaceSelectionInfo } from './types';
import { chain, isObject, omitBy } from 'lodash';

export function getTwinMakerWorkspaceInfoSupplier(
  req: (path: string, params?: any) => Promise<any>
): TwinMakerWorkspaceInfoSupplier {
  return {
    listWorkspaces: () => {
      return req('list/workspaces').catch((v) => {
        v.isHandled = true; // don't show an error popup
      });
    },
    getWorkspaceInfo: () => req('list/options'),
    getEntityInfo: (entityId: string) => {
      return req('list/entity', { id: entityId }).catch((v) => {
        v.isHandled = true; // don't show an error popup
      });
    },
    getEntity: (entityId: string) => {
      return req('entity', { id: entityId }).catch((v) => {
        v.isHandled = true; // don't show an error popup
      });
    },
    listScenes: () => req('list/scenes'),
    getWorkspace: () => req('workspace'),
    getToken: () => req('token'),
  };
}

export function getCachingWorkspaceInfoSupplier(supplier: TwinMakerWorkspaceInfoSupplier) {
  let info: WorkspaceSelectionInfo | undefined = undefined;
  return {
    ...supplier,
    getWorkspaceInfo: () => {
      if (info) {
        return Promise.resolve(info);
      }
      return supplier.getWorkspaceInfo().then((v) => {
        info = v;
        return v;
      });
    },
  };
}

export interface SelectionInfo<T = any> {
  options: Array<SelectableValue<T>>;
  current?: SelectableValue<T>;
}

export function getSelectionInfo<T>(
  v?: T,
  options?: Array<SelectableValue<T>>,
  templateVars?: Array<SelectableValue<T>>
): SelectionInfo<T> {
  if (v && !options) {
    const current = { label: `${v}`, value: v };
    return { options: [current], current };
  }
  if (!options) {
    options = [];
  }
  let current = options.find((item) => item.value === v);
  if (templateVars) {
    if (!current) {
      current = templateVars.find((item) => item.value === v);
    }
    options = [{ label: 'Use template variable', options: templateVars, icon: 'link-h' }, ...options];
  }

  if (v && !current) {
    current = {
      label: `${v} (not found)`,
      value: v,
    };
    if (current.label!.indexOf('$') >= 0) {
      current.label = `${v}`;
      const escaped = getTemplateSrv().replace(String(v));
      if (escaped !== current.label) {
        current.label += ` (variable)`;
      } else {
        current.label += ` ${escaped}`;
      }
    }
    options.push(current);
  }
  return {
    options,
    current,
  };
}

export const removeObjectsWithNull = (obj: object): object => {
  return chain(obj)
    .pickBy(isObject) // get only objects
    .mapValues(removeObjectsWithNull) // call only for values as objects
    .assign(omitBy(obj, isObject)) // save back result that is not object
    .omitBy((v) => !v) // remove null, false and empty values
    .value(); // get value
};
