import { SelectableValue } from '@grafana/data';

export type SelectableQueryResults = Array<SelectableValue<string>>;
export interface SelectableComponentInfo extends SelectableValue<string> {
  timeSeries?: SelectableQueryResults;
  props?: SelectableQueryResults;
}
export type SelectableComponents = SelectableComponentInfo[];

export interface WorkspaceSelectionInfo {
  entities: SelectableQueryResults;
  components: SelectableComponentInfo[];
  properties: SelectableQueryResults;
}

export interface TwinMakerWorkspaceInfoSupplier {
  listWorkspaces: () => Promise<SelectableQueryResults>;
  listScenes: () => Promise<SelectableQueryResults>;
  getWorkspaceInfo: () => Promise<WorkspaceSelectionInfo>;
  getEntityInfo: (entityId: string) => Promise<SelectableComponentInfo[]>;
  getEntity: (entityId: string) => Promise<any>;
  getWorkspace: () => Promise<any>;
  getToken: () => Promise<any>;
}
