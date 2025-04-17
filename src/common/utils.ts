import { sceneGraph, SceneObject, SceneObjectState, VizPanel } from '@grafana/scenes';

export function refreshPanelsInDashboard() {
  const panels = getAllDashboardPanels();
  for (const panel of panels) {
    panel.forceRender();
  }
}

function getAllDashboardPanels(): VizPanel[] {
  const sceneContext: SceneObject<SceneObjectState> = (window as any).__grafanaSceneContext;
  if (sceneContext) {
    return sceneGraph.findAllObjects(sceneContext, (obj) => obj.constructor.name === 'VizPanel') as VizPanel[];
  } else return [];
}
