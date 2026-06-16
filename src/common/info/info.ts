import { SelectableValue } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import {
  SelectableComponentInfo,
  SelectableQueryResults,
  TwinMakerWorkspaceInfoSupplier,
  WorkspaceSelectionInfo,
} from './types';
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

export enum ComponentFieldName {
  timeSeries = 'timeSeries',
  props = 'props',
  propGroups = 'propGroups',
}

export function resolvePropGroups(compName: SelectionInfo<string>, entityInfo: SelectableComponentInfo[] | undefined) {
  return entityInfo?.find((item) => item.value === compName.current?.value)?.propGroups ?? [];
}

export function resolvePropsFromComponentSel(
  compName: SelectionInfo<string>,
  field: ComponentFieldName,
  entityInfo: SelectableComponentInfo[] | undefined
) {
  let resolvedCompName: string | undefined;
  if (compName.current && compName.current.value && compName.current.value.indexOf('$') >= 0) {
    resolvedCompName = getTemplateSrv().replace(compName.current.value);
  }
  let propOpts = compName.current?.[field] as SelectableQueryResults | undefined;
  if (!propOpts && resolvedCompName) {
    const comp = entityInfo?.find((item) => item.value === resolvedCompName);
    propOpts = comp?.[field] as SelectableQueryResults;
  }
  return propOpts;
}

const handleValueNotFound = <T = any>(value: T, showNotFound = true) => {
  const current = {
    label: `${value} ${showNotFound ? '(not found)' : ''}`,
    value,
  };
  if (current.label!.indexOf('$') >= 0) {
    current.label = `${value}`;
    const escaped = getTemplateSrv().replace(String(value));
    if (escaped !== current.label) {
      current.label += ` (variable)`;
    } else {
      current.label += ` ${escaped}`;
    }
  }
  return current;
};

export interface MultiSelectionInfo<T = any> {
  options: Array<SelectableValue<T>>;
  current?: SelectableQueryResults;
}

export function getMultiSelectionInfo(
  values?: string[],
  options?: Array<SelectableValue<string>>,
  templateVars?: Array<SelectableValue<string>>
): MultiSelectionInfo<string> {
  if (values && !options) {
    const selected: SelectableQueryResults = [];
    for (const value of values) {
      const current = { label: `${value}`, value };
      selected.push(current);
    }
    return { options: selected, current: selected };
  }

  if (!options) {
    options = [];
  }
  if (templateVars) {
    options = [{ label: 'Use template variable', options: templateVars, icon: 'link-h' }, ...options];
  }
  const selected: SelectableQueryResults = [];
  if (values) {
    for (const value of values) {
      let current = options.find((item) => item.value === value);
      if (templateVars && !current) {
        current = templateVars.find((item) => item.value === value);
      }

      if (value && !current) {
        current = handleValueNotFound(value);
        options.push(current);
      }

      if (current) {
        selected.push(current);
      }
    }
  }
  return {
    options,
    current: selected,
  };
}

export interface SelectionInfo<T = any> {
  options: Array<SelectableValue<T>>;
  current?: SelectableValue<T>;
}

export function getSelectionInfo<T>(
  v?: T,
  options?: Array<SelectableValue<T>>,
  templateVars?: Array<SelectableValue<T>>,
  allowCustom?: boolean
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
    current = handleValueNotFound(v, false);
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
