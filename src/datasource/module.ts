import { DataSourcePlugin } from '@grafana/data';
import { TwinMakerDataSource } from './datasource';
import { ConfigEditor } from './components/ConfigEditor';
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
  .setVariableQueryEditor(VariableQueryEditor);

registerXFormer();
