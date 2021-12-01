import { PanelPlugin } from '@grafana/data';
import { getTwinMakerDatasourcePicker } from 'common/datasourceSrv';
import { EntryPicker } from './editor/EntryPicker';
import { VideoPlayerPanel } from './VideoPlayerPanel';
import { PanelOptions } from './types';

export const plugin = new PanelPlugin<PanelOptions>(VideoPlayerPanel).setPanelOptions((builder) => {
  builder
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
      id: 'kvsStreamName',
      path: 'kvsStreamName',
      name: 'KVS stream name',
      description: 'Enter your KVS stream name',
      defaultValue: '',
      settings: {
        isComponentName: false,
        isKvsStreamName: true,
      },
      editor: EntryPicker,
    })
    .addCustomEditor({
      id: 'entityId',
      path: 'entityId',
      name: 'Entity',
      description: 'Enter entityId for GG Edge Connector for KVS',
      defaultValue: '',
      settings: {
        isComponentName: false,
        isKvsStreamName: false,
      },
      editor: EntryPicker,
    })
    .addCustomEditor({
      id: 'componentName',
      path: 'componentName',
      name: 'Component name',
      description: 'Enter componentName for GG Edge Connector for KVS',
      defaultValue: '',
      settings: {
        isComponentName: true,
        isKvsStreamName: false,
      },
      editor: EntryPicker,
    });
});
