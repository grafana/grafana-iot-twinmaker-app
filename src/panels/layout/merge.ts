import { EventBus, InterpolateFunction } from '@grafana/data';
import { getLocationSrv, getTemplateSrv } from '@grafana/runtime';
import { TWINMAKER_PANEL_TYPE_ID } from 'common/constants';
import { PanelModel } from 'common/dashboard';
import { VariableAction } from './types';

export function prepareDashboardMerge(
  eventBus: EventBus,
  currentPanels: PanelModel[],
  newPanels: PanelModel[]
): PanelModel[] {
  const currLayout = currentPanels.find((panel) => panel.type === TWINMAKER_PANEL_TYPE_ID.LAYOUT);
  const newLayoutIndex = newPanels.findIndex((panel) => panel.type === TWINMAKER_PANEL_TYPE_ID.LAYOUT);
  if (newLayoutIndex < 0) {
    const types = newPanels.map((p) => p.type).join(', ');
    alert('Target dashboard must also have a layout panel.\n' + types);
    console.log('NOPE', newPanels);
    return [];
  }

  // For now, keep the same link panel we originally have
  if (currLayout) {
    const newViewer = newPanels[newLayoutIndex];
    currLayout.id = newViewer.id;
    currLayout.gridPos = newViewer.gridPos;
    newPanels[newLayoutIndex] = currLayout;
  }

  // Special care not to replace the scene viewer
  const currViewer = currentPanels.find((panel) => panel.type === TWINMAKER_PANEL_TYPE_ID.SCENE);
  const newViewerIndex = newPanels.findIndex((panel) => panel.type === TWINMAKER_PANEL_TYPE_ID.SCENE);
  const newViewer = newPanels[newViewerIndex];

  if (currViewer && newViewer) {
    // Use the panel id from newViewer so that when comparing the two viewer panels, they can match
    // and will not override any panel in the newPanels list that has the same panel id as currViewer.id.
    currViewer.id = newViewer.id;
    // Use the panel gridPos from newViewer so that after merging, the currViewer can be resized and placed according
    // to the newViewer.
    currViewer.gridPos = newViewer.gridPos;

    console.log('TODO, broadcast new options over', newViewer.options);

    newPanels[newViewerIndex] = currViewer;
  }
  return newPanels;
}

/** translate the variable action request into a URL parameter changes */
export function getQueryUpdate(
  actions: VariableAction[] | undefined,
  replace: InterpolateFunction
): Record<string, any> | undefined {
  if (!actions?.length) {
    return undefined;
  }

  let ok = false;
  const query: Record<string, any> = {};
  for (const action of actions) {
    let { variable, value } = action;
    if (variable) {
      const idx0 = variable.indexOf('{');
      const idx1 = variable.indexOf('}');
      if (idx0 >= 0 && idx1 > idx0) {
        variable = variable.substring(idx0 + 1, idx1);
      }
      query[`var-${variable}`] = value ? replace(value) : undefined;
      ok = true;
    }
  }
  return ok ? query : undefined;
}

export function doQueryUpdate(actions?: VariableAction[]): Record<string, any> | undefined {
  const query = getQueryUpdate(actions, (v) => getTemplateSrv().replace(v));
  if (query) {
    getLocationSrv().update({
      partial: true,
      query,
    });
  }
  return query;
}
