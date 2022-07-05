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
      description: 'Select an AWS IoT TwinMaker workspace',
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
      name: 'Kinesis video stream name',
      description: 'Enter an Amazon Kinesis video stream name for standard video playback',
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
      description: 'Enter an AWS IoT TwinMaker entityId with a video component',
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
      description: 'Enter an AWS IoT TwinMaker componentName with a video type',
      defaultValue: '',
      settings: {
        isComponentName: true,
        isKvsStreamName: false,
      },
      editor: EntryPicker,
    });
});
