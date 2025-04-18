import {
  SceneDataTransformer,
  sceneGraph,
  SceneObject,
  SceneObjectState,
  SceneQueryRunner,
  VizPanel,
} from '@grafana/scenes';

export function refreshPanelsInDashboard() {
  const panels = getAllDashboardPanels();
  panels.forEach((panel) => {
    const queryRunner = getQueryRunnerFor(panel);
    queryRunner?.runQueries();
  });
}

function getAllDashboardPanels(): VizPanel[] {
  const sceneContext: SceneObject<SceneObjectState> = (window as any).__grafanaSceneContext;
  if (sceneContext) {
    return sceneGraph.findAllObjects(sceneContext, (obj) => obj.constructor.name === 'VizPanel') as VizPanel[];
  } else return [];
}

export function getQueryRunnerFor(sceneObject: SceneObject | undefined): SceneQueryRunner | undefined {
  if (!sceneObject) {
    return undefined;
  }

  const dataProvider = sceneObject.state.$data ?? sceneObject.parent?.state.$data;
  if (dataProvider) {
    // if it has runQueries method, it's a SceneQueryRunner
    if ((dataProvider as SceneQueryRunner).runQueries) {
      return dataProvider as SceneQueryRunner;
    }
    // if it has state.transformations, it's a SceneDataTransformer
    if ((dataProvider as SceneDataTransformer).state.transformations) {
      return getQueryRunnerFor(dataProvider as SceneDataTransformer);
    }
  }
  return undefined;
}
