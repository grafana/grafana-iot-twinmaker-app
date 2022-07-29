import { DataBindingLabelKeys, IAnchorEvent, INavLink } from 'aws-iot-twinmaker-grafana-utils';
import { TWINMAKER_PANEL_TYPE_ID } from 'common/constants';
import { getCurrentDashboard, getDashboardByUid, PanelModel } from 'common/dashboard';
import { PanelOptions, PanelOptions as SceneViewerPanelOptions } from './types';
import { doQueryUpdate } from '../layout/merge';
import { VariableAction } from '../layout/types';

export function mergeDashboard(targetDashboardId?: string): Promise<PanelOptions | undefined> {
  if (!targetDashboardId) {
    return Promise.resolve(undefined);
  }

  return getDashboardByUid(targetDashboardId).then((meta) => {
    const dashboard = meta.dashboard;
    const currentDashboard = getCurrentDashboard();

    const currentViewerOptions = updateSceneViewerPanel(currentDashboard?.panels ?? [], dashboard.panels);

    const info = currentDashboard?.updatePanels(dashboard.panels);
    console.log('LOAD', info);
    return currentViewerOptions;
  });
}

export function updateSceneViewerPanel(currentPanels: PanelModel[], newPanels: PanelModel[]): PanelOptions {
  const currViewer = currentPanels.find((panel) => (panel as any).type === TWINMAKER_PANEL_TYPE_ID.SCENE);
  const newViewerIndex = newPanels.findIndex((panel) => (panel as any).type === TWINMAKER_PANEL_TYPE_ID.SCENE);
  const newViewer = newPanels[newViewerIndex];

  if (currViewer && newViewer && shouldMergeSceneViewer(currViewer, newViewer)) {
    // Use the panel id from newViewer so that when comparing the two viewer panels, they can match
    // and will not override any panel in the newPanels list that has the same panel id as currViewer.id.
    currViewer.id = newViewer.id;
    // Use the panel gridPos from newViewer so that after merging, the currViewer can be resized and placed according
    // to the newViewer.
    currViewer.gridPos = newViewer.gridPos;
    // Use the custom selected E/C variable names from newViewer
    currViewer.options.customSelEntityVarName = newViewer.options.customSelEntityVarName;
    currViewer.options.customSelCompVarName = newViewer.options.customSelCompVarName;
    // Override newViewer with currViewer so that the viewer will not be rerendered.
    newPanels[newViewerIndex] = currViewer;

    return currViewer.options;
  }
  return newViewer.options;
}

export function shouldMergeSceneViewer(
  currViewer: PanelModel<SceneViewerPanelOptions>,
  newViewer: PanelModel<SceneViewerPanelOptions>
): boolean {
  return (
    (currViewer.options.datasource === newViewer.options.datasource || !newViewer.options.datasource) &&
    (currViewer.options.sceneId === newViewer.options.sceneId || !newViewer.options.sceneId)
  );
}

export function getValidHttpUrl(navLinkProps?: INavLink) {
  if (!navLinkProps || !navLinkProps.destination) {
    return undefined;
  }

  try {
    const url = new URL(navLinkProps.destination);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      console.warn('Unknown protocol for link destination=', navLinkProps.destination);
      return undefined;
    }

    Object.keys(navLinkProps.params || {}).forEach((key) => {
      url.searchParams.append(key, navLinkProps.params?.[key]);
    });
    return url;
  } catch (_) {
    console.warn('Invalid link destination=', navLinkProps.destination);
    return undefined;
  }
}

export function updateUrlParams(
  selectedEntityVarName?: string,
  selectedComponentVarName?: string,
  selectedPropertyVarName?: string,
  anchorData?: IAnchorEvent
) {
  if (anchorData && anchorData.dataBindingContext) {
    const dataBinding: any = anchorData.dataBindingContext;
    let actions: VariableAction[] = [];

    if (selectedEntityVarName) {
      actions.push({
        variable: selectedEntityVarName,
        value: dataBinding[DataBindingLabelKeys.entityId],
      });
    }

    if (selectedComponentVarName) {
      actions.push({
        variable: selectedComponentVarName,
        value: dataBinding[DataBindingLabelKeys.componentName],
      });
    }

    if (selectedPropertyVarName) {
      actions.push({
        variable: selectedPropertyVarName,
        value: dataBinding[DataBindingLabelKeys.propertyName],
      });
    }

    Object.keys(anchorData.navLink?.params || {}).forEach((key) => {
      actions.push({
        variable: key,
        value: anchorData.navLink?.params?.[key],
      });
    });

    actions = actions.map((action) => {
      if (action.value && !anchorData.isSelected) {
        const emptyAction: VariableAction = {
          variable: action.variable,
          value: undefined,
        };
        return emptyAction;
      }
      return action;
    });

    doQueryUpdate(actions);
  }
}
