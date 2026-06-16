import { DataQueryRequest } from '@grafana/data';
import { DataQuery } from '@grafana/schema';
import { getSimpleTwinMakerDashboardManager } from './managerSimple';

export enum TwinMakerQueryType {
  // Ask the frontend
  TwinMakerPanel = 'TwinMakerPanel',

  // Backend queries
  ListWorkspace = 'ListWorkspace',
  ListScenes = 'ListScenes',
  ListEntities = 'ListEntities',
  GetEntity = 'GetEntity',
  GetPropertyValue = 'GetPropertyValue',
  ComponentHistory = 'ComponentHistory',
  EntityHistory = 'EntityHistory',
  GetAlarms = 'GetAlarms',

  // Used for variable queries
  ListComponentTypes = 'ListComponentTypes',
  ListComponentNames = 'ListComponentNames',
}

export enum TwinMakerResultOrder {
  ASCENDING = 'ASCENDING',
  DESCENDING = 'DESCENDING',
}

export interface TwinMakerOrderBy {
  propertyName: string;
  order?: TwinMakerResultOrder;
}

export const DEFAULT_PROPERTY_FILTER_OPERATOR = '='; // real value depends on lambda configuration

export interface TwinMakerFilterValue {
  booleanValue?: boolean;
  doubleValue?: number;
  integerValue?: number;
  longValue?: number;
  stringValue?: string;
}

export interface TwinMakerPropertyFilter {
  name: string;
  value: TwinMakerFilterValue;
  op: string;
}

export interface TwinMakerTabularConditions {
  orderBy: TwinMakerOrderBy[];
  propertyFilter: TwinMakerPropertyFilter[];
}

export interface TwinMakerQuery extends DataQuery {
  queryType?: TwinMakerQueryType;
  nextToken?: string;

  //  workspaceId?: string;
  entityId?: string;
  componentName?: string;
  componentTypeId?: string;
  properties?: string[];
  filter?: TwinMakerPropertyFilter[];
  maxResults?: number;
  order?: TwinMakerResultOrder;
  grafanaLiveEnabled: boolean;
  isStreaming?: boolean;
  intervalStreaming?: string;
  propertyDisplayNames: { [key: string]: string };

  // Athena Data Connector parameters for GetPropertyValue query
  tabularConditions?: TwinMakerTabularConditions;
  propertyGroupName?: string;
}

/** Request without targets */
export type BaseDataQueryOptions = Omit<DataQueryRequest, 'targets'>;

export enum TwinMakerPanelTopic {
  /** the selected item */
  SelectedItem = 'selectedItem',

  /** the selected alarm */
  SelectedAlarm = 'selectedAlarm',

  /** components in the view */
  VisibleComponents = 'visibleComponents',

  /** anchors in view */
  VisibleAnchors = 'visibleAnchors',
}
export interface TwinMakerPanelInstance {
  /**
   * TODO?
   * callback when the dashboard manager discovers an event
   */
  onDashboardAction: (cmd: any) => void;
}

/** Singleton controller for the whole dashboard.  Will manage layout and posting commands */
export interface TwinMakerDashboardManager {
  /** Called when a scene panel initializes */
  registerTwinMakerPanel: (panelId: number, panel: TwinMakerPanelInstance) => void;

  /** Called when a scene panel is unmounted */
  destroyTwinMakerPanel: (panelId: number) => void;
}

let singletonInstance: TwinMakerDashboardManager;

export const setTwinMakerDashboardManager = (instance: TwinMakerDashboardManager) => {
  singletonInstance = instance;
};

export const getTwinMakerDashboardManager = (): TwinMakerDashboardManager => {
  if (!singletonInstance) {
    return getSimpleTwinMakerDashboardManager();
  }
  return singletonInstance;
};
