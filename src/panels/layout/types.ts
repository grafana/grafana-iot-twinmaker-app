export enum DisplayMode {
  EntityName = 'entityName',
  EntityDetails = 'entityDetails',
  ComponentTypeId = 'componentTypeId',
}

export interface VariableAction {
  variable: string;
  value?: string;
}
export interface LayoutRule {
  componentTypeId: string;
  actions: VariableAction[];
  dashboard?: string;
}

export interface LayoutPanelOptions {
  datasource?: string;

  show: DisplayMode;

  // Template variables
  entityId: string;

  // Template variables
  component: string;

  // Check rules
  rules: LayoutRule[];
}
