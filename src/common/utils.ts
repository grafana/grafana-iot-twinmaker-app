import { SceneDataTransformer, SceneObject, SceneObjectState, SceneQueryRunner, VizPanel } from '@grafana/scenes';
import { lte } from 'semver';
import { PanelModel } from './dashboard';
import { config } from '@grafana/runtime';

export async function refreshPanelsInDashboard() {
  if (isGrafanaLte10()) {
    refreshAngularDashboard();
  } else {
    const panels = await getAllDashboardPanels();
    panels.forEach((panel) => {
      const queryRunner = getQueryRunnerFor(panel);
      queryRunner?.runQueries();
    });
  }
}

async function getAllDashboardPanels(): Promise<VizPanel[]> {
  const sceneContext: SceneObject<SceneObjectState> = (window as any).__grafanaSceneContext;
  if (sceneContext) {
    try {
      // alarm panel fails to load if sceneGraph is imported at the top level in 10, so it needs to be conditionally imported
      const scenes = await import(/* webpackMode: "eager" */ '@grafana/scenes');
      return scenes.sceneGraph.findAllObjects(
        sceneContext,
        (obj) => obj?.state?.key?.includes('panel') ?? false
      ) as VizPanel[];
    } catch (error) {
      console.error('Failed to load scenes:', error);
      return [];
    }
  }
  return [];
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

async function refreshAngularDashboard() {
  try {
    // Grafana will stop plugin from loading in >=12 if we import getLegacyAngularInjector at top level, so have to lazy load it
    const runtime = await import('@grafana/runtime');
    // @ts-ignore-next-line
    const $injector = runtime.getLegacyAngularInjector();
    if ($injector) {
      const dashboardSrv = $injector.get('dashboardSrv');
      dashboardSrv.dashboard?.panels?.forEach((panel: PanelModel) => panel.refresh());
    }
  } catch (error) {
    console.error('Failed to load grafana/runtime:', error);
    return;
  }
}

function isGrafanaLte10(): boolean {
  let grafanaVersion = config.buildInfo?.version;
  return lte(grafanaVersion, '10.4.17');
}
