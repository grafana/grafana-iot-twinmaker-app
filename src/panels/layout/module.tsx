import { PanelPlugin } from '@grafana/data';
import { getTwinMakerDatasourcePicker } from 'common/datasourceSrv';
import { getVariableOptions } from 'common/variables';
import { LayoutRulesEditor } from './editor/LayoutRulesEditor';
import { LayoutPanel } from './LayoutPanel';
import { DisplayMode, LayoutPanelOptions } from './types';

export const plugin = new PanelPlugin<LayoutPanelOptions>(LayoutPanel).setPanelOptions((builder) => {
  const variables = getVariableOptions();
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
    .addRadio({
      path: 'show',
      name: 'Show',
      settings: {
        options: [
          { label: 'Entity name', value: DisplayMode.EntityName },
          { label: 'Component type', value: DisplayMode.ComponentTypeId },
          { label: 'Debug', value: DisplayMode.EntityDetails },
        ],
      },
      defaultValue: DisplayMode.EntityName,
    })
    .addSelect({
      path: 'entityId',
      name: 'Entity selection',
      settings: {
        options: variables,
      },
      defaultValue: '',
    })
    .addSelect({
      path: 'component',
      name: 'Component selection',
      settings: {
        options: variables,
      },
      defaultValue: '',
    })
    .addCustomEditor({
      id: 'rules',
      path: 'rules',
      name: 'Select layout',
      description: 'Change the dashboard layout based on currently selected item.',
      defaultValue: [],
      editor: LayoutRulesEditor,
    });
});
