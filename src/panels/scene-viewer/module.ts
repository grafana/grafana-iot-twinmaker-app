import { PanelPlugin } from '@grafana/data';
import { PanelOptions } from './types';
import { ScenePanel } from './ScenePanel';
import { getTwinMakerDatasourcePicker } from 'common/datasourceSrv';
import { ScenePicker } from './editor/ScenePicker';
import { getVariableOptions } from 'common/variables';

export const plugin = new PanelPlugin<PanelOptions>(ScenePanel)
  .setNoPadding() // removes the border
  .setPanelOptions((builder) => {
    const variables = getVariableOptions();
    return builder
      .addSelect({
        path: 'datasource',
        name: 'Workspace',
        settings: {
          options: [],
          getOptions: async () => {
            return getTwinMakerDatasourcePicker();
          },
        },
        defaultValue: '',
      })
      .addCustomEditor({
        id: 'sceneId',
        name: 'Scene',
        path: 'sceneId',
        editor: ScenePicker,
      })
      .addSelect({
        path: 'customSelEntityVarName',
        name: 'Selected entity variable name',
        settings: {
          options: variables,
        },
      })
      .addSelect({
        path: 'customSelCompVarName',
        name: 'Selected component variable name',
        settings: {
          options: variables,
        },
      })
      .addSelect({
        path: 'customSelPropertyVarName',
        name: 'Selected property variable name',
        settings: {
          options: variables,
        },
      })
      .addSelect({
        path: 'customInputActiveCamera',
        name: 'Active camera variable name',
        settings: {
          options: variables,
        },
      })
      .addBooleanSwitch({
        path: 'enableAutoQuery',
        name: 'Enable auto query',
        description: 'By enabling auto query, the scene viewer panel can auto query all data bindings configured in the scene and ignore queries configured with the panel.',
        defaultValue: false,
      })
      .addNumberInput({
        path: 'queryRefreshInterval',
        name: 'Query interval',
        description: 'Set an interval in seconds to auto query data and applied only when a relative time range is set.',
        defaultValue: 5,
      })
      ;
  });
