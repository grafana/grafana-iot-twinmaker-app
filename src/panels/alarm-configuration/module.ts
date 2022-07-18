import { PanelPlugin } from '@grafana/data';
import { PanelOptions } from './types';
import { AlarmConfigurationPanel } from './AlarmConfigurationPanel';
import { getTwinMakerDatasourcePicker } from 'common/datasourceSrv';

export const plugin = new PanelPlugin<PanelOptions>(AlarmConfigurationPanel).setPanelOptions((builder) => {
  return builder.addSelect({
    path: 'datasource',
    name: 'Workspace',
    settings: {
      options: [],
      getOptions: async () => {
        return getTwinMakerDatasourcePicker();
      },
    },
    defaultValue: '',
  });
});
