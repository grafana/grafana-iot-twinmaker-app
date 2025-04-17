import React from 'react';
import { Unsubscribable } from 'rxjs';
import { PanelProps } from '@grafana/data';
import { LoadingPlaceholder } from '@grafana/ui';

import { ScenePanelState } from './interfaces';

import { SceneViewer } from './SceneViewer';
import { configureSdkWithDataSource, DataSourceParams } from '../sdkInit';
import { PanelOptions } from './types';
import { getTwinMakerDashboardManager } from 'common/manager';

type Props = PanelProps<PanelOptions>;

// Wrapper to get TwinMaker UX SDK and inject the redux store to the SceneViewer
export class ScenePanel extends React.Component<Props, ScenePanelState> {
  private dataSourceParams?: DataSourceParams;
  private unsubscribeEventBus?: Unsubscribable;

  constructor(props: Props) {
    super(props);
    this.state = {
      configured: false,
    };
  }

  componentDidMount() {
    this.updateUxSdk();
  }

  componentWillUnmount() {
    getTwinMakerDashboardManager().destroyTwinMakerPanel(this.props.id);
    this.unsubscribeEventBus?.unsubscribe();
  }

  componentDidUpdate(prevProps: Props, prevStates: ScenePanelState) {
    if (this.props.options.datasource !== prevProps.options.datasource) {
      this.updateUxSdk();
    }
  }

  private updateUxSdk = async () => {
    const uid = this.props.options.datasource;
    configureSdkWithDataSource(uid).then((result: DataSourceParams | undefined) => {
      this.dataSourceParams = result;
      this.setState({ configured: true });
    });
  };

  private renderContent = () => {
    const hasSceneInput = !!this.props.options.sceneId;
    return this.dataSourceParams ? (
      hasSceneInput ? (
        <SceneViewer {...this.props} {...this.dataSourceParams} />
      ) : (
        <div> Missing TwinMaker scene in panel display options </div>
      )
    ) : (
      <div> No TwinMaker Data Source Connected </div>
    );
  };

  render() {
    return this.state.configured ? this.renderContent() : <LoadingPlaceholder text={'Loading...'} />;
  }
}
