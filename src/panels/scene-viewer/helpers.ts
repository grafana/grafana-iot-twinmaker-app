import { DataBindingLabelKeys, ITagData, INavLink } from '@iot-app-kit/scene-composer';
import { TWINMAKER_PANEL_TYPE_ID } from 'common/constants';
import { PanelModel } from 'common/dashboard';
import { PanelOptions, PanelOptions as SceneViewerPanelOptions } from './types';
import { getLocationSrv, getTemplateSrv } from '@grafana/runtime';
import { InterpolateFunction } from '@grafana/data';

export interface VariableAction {
  variable: string;
  value?: string;
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
  anchorData?: ITagData
) {
  const dataBinding: any = anchorData?.dataBindingContext || {};
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

  Object.keys(anchorData?.navLink?.params || {}).forEach((key) => {
    actions.push({
      variable: key,
      value: anchorData?.navLink?.params?.[key],
    });
  });
  doQueryUpdate(actions);
}

function doQueryUpdate(actions?: VariableAction[]): Record<string, any> | undefined {
  const query = getQueryUpdate(actions, (v) => getTemplateSrv().replace(v));
  if (query) {
    getLocationSrv().update({
      partial: true,
      query,
    });
  }
  return query;
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
