/**
 * The panel options saved in JSON
 */
export interface PanelOptions {
  // When falsy, this should pick the default or first twinmaker datasource instance
  datasource?: string;

  // The actual scene to load
  sceneId: string;
  // Matterport space details
  mp_spaceId?: string;
  mp_application_key?: string;

  customSelEntityVarName?: string;
  customSelCompVarName?: string;
  customSelPropertyVarName?: string;
  customInputActiveCamera?: string;
}
