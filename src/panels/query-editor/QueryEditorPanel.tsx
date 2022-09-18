import React from 'react';
import { LoadingPlaceholder } from '@grafana/ui';
import { PanelProps } from '@grafana/data';
import { QueryEditorPanelState, QueryEditorPropsFromParent } from './interfaces';

import { QueryEditor } from './QueryEditor';
import { configureSdkWithDataSource, DataSourceParams } from '../sdkInit';
import { PanelOptions } from './types';

type Props = PanelProps<PanelOptions>;

export class QueryEditorPanel extends React.Component<Props, QueryEditorPanelState, QueryEditorPropsFromParent> {
  private dataSourceParams?: DataSourceParams;

  constructor(props: Props) {
    super(props);
    this.state = {
      configured: false,
    };
  }

  componentDidMount() {
    this.updateUxSdk();
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.options.datasource !== prevProps.options.datasource) {
      this.updateUxSdk();
    }
  }

  private updateUxSdk = async (prevProps?: Props) => {
    configureSdkWithDataSource(this.props.options.datasource).then(async (result: DataSourceParams | undefined) => {
      this.dataSourceParams = result;
      const awsCredentials = await this.dataSourceParams.awsTMQEConfig.credentialsProvider();
      this.dataSourceParams.awsTMQEConfig.awsCredentials = awsCredentials;
      this.setState({ configured: true });
    });
  };

  private renderContent = () => {
    return this.dataSourceParams ? (
      <QueryEditor workspaceId={this.dataSourceParams.workspaceId} awsConfig={this.dataSourceParams.awsTMQEConfig} />
    ) : (
      <div> No TwinMaker Data Source Connected </div>
    );
  };

  render() {
    return this.state.configured ? this.renderContent() : <LoadingPlaceholder text={'Loading...'} />;
  }
}
