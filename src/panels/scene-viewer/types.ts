/**
 * The panel options saved in JSON
 */
export interface PanelOptions {
  // When falsy, this should pick the default or first twinmaker datasource instance
  datasource?: string;

  // The actual scene to load
  sceneId: string;

  customSelEntityVarName?: string;
  customSelCompVarName?: string;
  customSelPropertyVarName?: string;
  customInputActiveCamera?: string;

  enableAutoQuery?: boolean;
  queryRefreshInterval?: number;
}
