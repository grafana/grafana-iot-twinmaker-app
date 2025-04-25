import { SelectableValue } from '@grafana/data';
import { TwinMakerQueryType, TwinMakerQuery, TwinMakerResultOrder } from 'common/manager';

export interface QueryTypeInfo extends SelectableValue<TwinMakerQueryType> {
  value: TwinMakerQueryType; // not optional
  defaultQuery: Partial<TwinMakerQuery>;
  helpURL?: string;
}

export const twinMakerQueryTypes: QueryTypeInfo[] = [
  {
    label: 'Get Property Value History by Entity',
    value: TwinMakerQueryType.EntityHistory,
    description: `Gets the history of a component's property for a specific entity.`,
    defaultQuery: {},
  },
  {
    label: 'Get Property Value History by Component Type',
    value: TwinMakerQueryType.ComponentHistory,
    description: `Gets the history of a property within a component of a specific componentType.`,
    defaultQuery: {},
  },
  {
    label: 'Get Alarms',
    value: TwinMakerQueryType.GetAlarms,
    description: `Gets the alarms within a workspace.`,
    defaultQuery: {},
  },
  {
    label: 'Get Property Value',
    value: TwinMakerQueryType.GetPropertyValue,
    description: `Gets the value of a non-time series property within a component.`,
    defaultQuery: {},
  },
  {
    label: 'List Workspaces',
    value: TwinMakerQueryType.ListWorkspace,
    description: `Retrieves the list of workspaces.`,
    defaultQuery: {},
  },
  {
    label: 'List Scenes',
    value: TwinMakerQueryType.ListScenes,
    description: `Retrieves the list of scenes associated with a workspace.`,
    defaultQuery: {},
  },
  {
    label: 'List Entities',
    value: TwinMakerQueryType.ListEntities,
    description: `Retrieves the list of entities associated with a workspace.`,
    defaultQuery: {},
  },
  {
    label: 'Get Entity',
    value: TwinMakerQueryType.GetEntity,
    description: `Gets an entity within a workspace.`,
    defaultQuery: {},
  },
];

export function changeQueryType(q: TwinMakerQuery, info: QueryTypeInfo): TwinMakerQuery {
  if (q.queryType === info.value) {
    return q; // no change;
  }
  const copy = {
    ...info.defaultQuery,
    ...q,
    queryType: info.value,
  };

  delete copy.filter;
  switch (copy.queryType) {
    case TwinMakerQueryType.ComponentHistory:
      delete copy.order;
      break;
    case TwinMakerQueryType.EntityHistory:
      delete copy.order;
      delete copy.componentTypeId;
      break;
    case TwinMakerQueryType.GetAlarms:
      copy.filter = [
        {
          name: 'alarm_status',
          value: {
            stringValue: 'ACTIVE',
          },
          op: '=',
        },
      ];
      break;
  }
  return copy;
}

export const twinMakerOrderOptions = [
  {
    label: 'ASC',
    value: TwinMakerResultOrder.ASCENDING,
    icon: 'arrow-up',
  },
  {
    label: 'DESC',
    value: TwinMakerResultOrder.DESCENDING,
    icon: 'arrow-down',
  },
];
