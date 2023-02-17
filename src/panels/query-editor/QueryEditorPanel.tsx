import React from 'react';
import { LoadingPlaceholder } from '@grafana/ui';
import { PanelProps } from '@grafana/data';
import { QueryEditorPanelState } from './interfaces';
import { QueryEditor } from './QueryEditor';
import { configureSdkWithDataSource, DataSourceParams } from '../sdkInit';
import { PanelOptions } from './types';
import './styles.css';

type Props = PanelProps<PanelOptions>;

export class QueryEditorPanel extends React.Component<Props, QueryEditorPanelState> {
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

  private updateUxSdk = async () => {
    configureSdkWithDataSource(this.props.options.datasource).then(async (result: DataSourceParams | undefined) => {
      this.dataSourceParams = result;

      if (this.dataSourceParams) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const awsCredentials = await this.dataSourceParams.awsConfig.credentialsProvider();
        this.dataSourceParams.awsConfig.awsCredentials = awsCredentials;
      }

      this.setState({ configured: true });
    });
  };

  private renderContent = () => {
    return this.dataSourceParams ? (
      <QueryEditor {...this.props} {...this.dataSourceParams} />
    ) : (
      <div> No TwinMaker Data Source Connected </div>
    );
  };

  render() {
    return this.state.configured ? this.renderContent() : <LoadingPlaceholder text={'Loading...'} />;
  }
}
