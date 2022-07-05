import { PanelPlugin } from '@grafana/data';
import { PanelOptions } from './types';
import { ScenePanel } from './ScenePanel';
import { getTwinMakerDatasourcePicker } from 'common/datasourceSrv';
import { ScenePicker } from './editor/ScenePicker';
import { getVariableOptions } from 'common/variables';

export const plugin = new PanelPlugin<PanelOptions>(ScenePanel)
  .setNoPadding() // removes the border
  .setPanelOptions((builder) => {
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
          options: getVariableOptions(),
        },
      })
      .addSelect({
        path: 'customSelCompVarName',
        name: 'Selected component variable name',
        settings: {
          options: getVariableOptions(),
        },
      })
      .addSelect({
        path: 'customSelPropertyVarName',
        name: 'Selected property variable name',
        settings: {
          options: getVariableOptions(),
        },
      });
  });
