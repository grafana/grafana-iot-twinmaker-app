/**
 * The panel options saved in JSON
 */
export interface PanelOptions {
  // When falsy, this should pick the default or first twinmaker datasource instance
  datasource?: string;

  kvsStreamName: string;
  entityId: string;
  componentName: string;
}
