import { DataSourcePlugin } from '@grafana/data';
import { TwinMakerDataSource } from './datasource';
import { ConfigEditor } from './components/ConfigEditor';
import { AdditionalSettings } from './components/AdditionalSettings';
import { QueryEditor } from './components/QueryEditor';
import { TwinMakerDataSourceOptions } from './types';
import VariableQueryEditor from './components/VariableQueryEditor';
import { registerXFormer } from 'transformer/RegisterTwinMakerLinksEditor';
import { TwinMakerQuery } from 'common/manager';

export const plugin = new DataSourcePlugin<TwinMakerDataSource, TwinMakerQuery, TwinMakerDataSourceOptions>(
  TwinMakerDataSource
)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor)
  .setVariableQueryEditor(VariableQueryEditor)
  .addConfigPage({
    title: '  Additional Settings',
    icon: 'fa fa-cog',
    // @ts-ignore - Would expect a Class component, however works absolutely fine with a functional one
    body: AdditionalSettings,
    id: 'additional-settings',
  });

registerXFormer();
