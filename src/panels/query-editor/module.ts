import { PanelPlugin } from '@grafana/data';
import { PanelOptions } from './types';
import { QueryEditorPanel } from './QueryEditorPanel';
import { getTwinMakerDatasourcePicker } from 'common/datasourceSrv';

export const plugin = new PanelPlugin<PanelOptions>(QueryEditorPanel).setPanelOptions((builder) => {
  builder.addSelect({
    path: 'datasource',
    name: 'Workspace',
    description: 'Select an AWS IoT TwinMaker workspace',
    settings: {
      options: [],
      getOptions: async () => {
        return getTwinMakerDatasourcePicker();
      },
    },
    defaultValue: '',
  });
});
