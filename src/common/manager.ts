import { SelectableValue, DataQueryResponse, DataQuery, DataQueryRequest } from '@grafana/data';
import { Observable } from 'rxjs';
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

export interface TwinMakerPropertyFilter {
  name: string;
  value: string;
  op: string;
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
  orderBy?: TwinMakerOrderBy[];
  maxResults?: number;
  order?: TwinMakerResultOrder;
  grafanaLiveEnabled: boolean;
  isStreaming?: boolean;
  intervalStreaming?: string;
}

export interface TwinMakerPanelQuery extends TwinMakerQuery {
  queryType: TwinMakerQueryType.TwinMakerPanel;

  panelId?: number;
  topic?: TwinMakerPanelTopic;
}

export function isTwinMakerPanelQuery(query: DataQuery): query is TwinMakerPanelQuery {
  return query?.queryType === TwinMakerQueryType.TwinMakerPanel;
}

/** Request without targets */
export type BaseDataQueryOptions = Omit<DataQueryRequest, 'targets'>;

export type TwinMakerPanelQueryRunner = (
  query: TwinMakerPanelQuery,
  options: BaseDataQueryOptions
) => Observable<DataQueryResponse>;

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

export interface TwinMakerPanelTopicInfo extends SelectableValue<TwinMakerPanelTopic> {
  showPartialQuery?: boolean;
}

export const panelTopicInfo: TwinMakerPanelTopicInfo[] = [
  {
    value: TwinMakerPanelTopic.SelectedItem,
    label: 'Selected item',
    description: 'Show the selected target from a scene',
    showPartialQuery: true,
  },
  {
    value: TwinMakerPanelTopic.SelectedAlarm,
    label: 'Selected alarm',
    description: 'Show the selected target from a scene',
    showPartialQuery: true,
  },
  {
    value: TwinMakerPanelTopic.VisibleComponents,
    label: 'Visible components (future)',
    description: 'Show the selected target from a scene',
  },
  {
    value: TwinMakerPanelTopic.VisibleAnchors,
    label: 'Visible anchors (future)',
    description: 'Show the selected target from a scene',
  },
];

export interface TwinMakerPanelInstance {
  /**
   * Panel query execution
   */
  twinMakerPanelQueryRunner: TwinMakerPanelQueryRunner;

  /**
   * TODO?
   * callback when the dashbaord manager discovers an event
   */
  onDashboardAction: (cmd: any) => void;
}

/** Singleton controller for the whole dashboard.  Will manage layout and posting commands */
export interface TwinMakerDashboardManager {
  /** Execute a panel query  */
  twinMakerPanelQueryRunner: TwinMakerPanelQueryRunner;

  /** Find the current   */
  listTwinMakerPanels: () => Array<SelectableValue<number>>;

  /** Refresh any panels listening to the twinmaker panel for actions */
  refresh: (panelId?: number) => void;

  /**
   * Get the supported query options
   */
  getQueryTopics: (panelId?: number) => TwinMakerPanelTopicInfo[];

  /** Called when a scene panel initalizes */
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
