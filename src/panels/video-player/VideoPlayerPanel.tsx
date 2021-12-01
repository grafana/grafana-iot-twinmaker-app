import React from 'react';
import { PanelProps } from '@grafana/data';
import { LoadingPlaceholder } from '@grafana/ui';
import { VideoPlayer } from './VideoPlayer';
import { VideoPlayerPanelState } from './interfaces';
import { configureSdkWithDataSource, DataSourceParams } from '../sdkInit';
import { PanelOptions } from './types';
import { getTemplateSrv } from '@grafana/runtime';

type Props = PanelProps<PanelOptions>;
export class VideoPlayerPanel extends React.Component<Props, VideoPlayerPanelState> {
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

  componentDidUpdate(prevProps: Props, prevStates: VideoPlayerPanelState) {
    if (this.props.options.datasource !== prevProps.options.datasource) {
      this.updateUxSdk();
    }
  }

  private updateUxSdk = async (prevProps?: Props) => {
    configureSdkWithDataSource(this.props.options.datasource).then((result: DataSourceParams | undefined) => {
      this.dataSourceParams = result;
      this.setState({ configured: true });
    });
  };

  private renderContent = () => {
    const templateSrv = getTemplateSrv();
    const entityId = templateSrv.replace(this.props.options.entityId);
    const componentName = templateSrv.replace(this.props.options.componentName);
    const kvsStreamName = templateSrv.replace(this.props.options.kvsStreamName);
    return this.dataSourceParams ? (
      <VideoPlayer
        {...this.props}
        {...this.dataSourceParams}
        entityId={entityId}
        componentName={componentName}
        kvsStreamName={kvsStreamName}
      />
    ) : (
      <div> No TwinMaker Data Source Connected </div>
    );
  };

  render() {
    return this.state.configured ? this.renderContent() : <LoadingPlaceholder text={'Loading...'} />;
  }
}
