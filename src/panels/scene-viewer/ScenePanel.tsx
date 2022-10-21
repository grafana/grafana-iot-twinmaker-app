import React from 'react';
import { Provider } from 'react-redux';
import { Unsubscribable, throwError } from 'rxjs';
import { PanelProps } from '@grafana/data';
import { LoadingPlaceholder } from '@grafana/ui';

import { ScenePanelState } from './interfaces';

import { SceneViewer } from './SceneViewer';
import { configureSdkWithDataSource, DataSourceParams } from '../sdkInit';
import { PanelOptions } from './types';
import { getTwinMakerDashboardManager } from 'common/manager';
import { getTwinMakerDatasource } from 'common/datasourceSrv';

type Props = PanelProps<PanelOptions>;

// Wrapper to get TwinMaker UX SDK and inject the redux store to the SceneViewer
export class ScenePanel extends React.Component<Props, ScenePanelState> {
  private dataSourceParams?: DataSourceParams;
  private unsubscribeEventBus?: Unsubscribable;

  constructor(props: Props) {
    super(props);
    getTwinMakerDashboardManager().registerTwinMakerPanel(this.props.id, {
      twinMakerPanelQueryRunner: () => throwError(() => `not implemented yet (see twinmaker debug panel)`),
      onDashboardAction: (cmd) => {
        console.log('TODO! implement action sent from the manager???', cmd);
      },
    });
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
    const ds = await getTwinMakerDatasource(uid);
    if (ds) {
      try {
        const mpToken = await ds.info.getMatterportToken();
        if (mpToken) {
          this.setState({
            mp_accessToken: mpToken.access_token,
          });
        } else {
          this.setState({
            mp_accessToken: undefined,
          });
        }
      } catch (err: any) {
        err.isHandled = true;
      }
    }

    configureSdkWithDataSource(uid).then((result: DataSourceParams | undefined) => {
      this.dataSourceParams = result;
      this.setState({ configured: true });
    });
  };

  private renderContent = () => {
    const hasSceneInput = !!this.props.options.sceneId;
    return this.dataSourceParams ? (
      hasSceneInput ? (
        <Provider store={this.dataSourceParams.store}>
          <SceneViewer {...this.props} {...this.dataSourceParams} mp_accessToken={this.state.mp_accessToken} />
        </Provider>
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
