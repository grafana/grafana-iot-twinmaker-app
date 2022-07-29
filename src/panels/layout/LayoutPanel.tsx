import React, { Component } from 'react';
import { ArrayDataFrame, DataQueryResponseData, PanelProps } from '@grafana/data';

import { DisplayMode, LayoutPanelOptions } from './types';
import { TwinMakerDataSource } from 'datasource/datasource';
import { getTwinMakerDatasource } from 'common/datasourceSrv';
import { getTemplateSrv } from '@grafana/runtime';
import { removeObjectsWithNull } from 'common/info/info';
import {
  BaseDataQueryOptions,
  getTwinMakerDashboardManager,
  TwinMakerPanelQuery,
  TwinMakerPanelTopic,
  TwinMakerQuery,
  TwinMakerQueryType,
} from 'common/manager';
import { ReplaySubject, of, throwError } from 'rxjs';
import { getCurrentDashboard } from 'common/dashboard';
import { doQueryUpdate, mergeDashboard } from './merge';
import { TWINMAKER_PANEL_TYPE_ID } from 'common/constants';
import { CustomScrollbar } from '@grafana/ui';

const twinMakerQueries: Array<Partial<TwinMakerQuery>> = [
  { queryType: TwinMakerQueryType.ListWorkspace },
  { queryType: TwinMakerQueryType.ListScenes },
  { queryType: TwinMakerQueryType.ListEntities },
  { queryType: TwinMakerQueryType.GetAlarms },
];

type Props = PanelProps<LayoutPanelOptions>;
interface State {
  // Selected
  entityId: string;
  component: string;

  // Loaded based on template variables
  entityInfo?: any;
  componentInfo?: any;

  // for dummy example
  twinMakerQueryIndex: number;
}

export class LayoutPanel extends Component<Props, State> {
  private visSim = new ReplaySubject<DataQueryResponseData>();
  ds?: TwinMakerDataSource;
  loading?: boolean;
  initalized?: boolean;
  dashboardUid: string | undefined;
  error?: string;

  constructor(props: Props) {
    super(props);

    const { options } = props;
    const templateSrv = getTemplateSrv();
    this.state = {
      entityId: templateSrv.replace(options.entityId) ?? '',
      component: templateSrv.replace(options.component) ?? '',
      twinMakerQueryIndex: 0,
    };

    const dashboard = getCurrentDashboard();
    if (dashboard) {
      this.dashboardUid = dashboard.uid;
      for (const panel of dashboard.panels) {
        if (panel.id !== this.props.id && panel.type === TWINMAKER_PANEL_TYPE_ID.LAYOUT) {
          const isEditor = window.location.href.includes('editPanel');
          if (!isEditor) {
            this.error = 'Only one layout panel allowed in a dashboard';
          }
          break;
        }
      }
    }

    this.initWorkspace();
  }

  initWorkspace = () => {
    if (this.error) {
      console.log('skip updates');
      return;
    }
    getTwinMakerDatasource(this.props.options.datasource).then((ds) => {
      this.ds = ds;
      this.updateEntryInfo(this.state.entityId);

      if (!this.initalized) {
        // Delay until datasource is loaded (will keep clients spinning)
        getTwinMakerDashboardManager().registerTwinMakerPanel(this.props.id, {
          twinMakerPanelQueryRunner: this.twinMakerPanelQueryRunner,
          onDashboardAction: (cmd) => {
            console.log('TODO! implement action sent from the manager???', cmd);
          },
        });
      }
    });
  };

  updateEntryInfo = (entityId: string) => {
    if (!this.ds) {
      console.log('no datasource');
      return;
    }
    if (!entityId) {
      return;
    }
    this.loading = true;
    this.ds.info.getEntity(entityId).then((v) => {
      this.loading = false;
      this.setState({ entityId, entityInfo: removeObjectsWithNull(v) });
      this.checkCurrentLayout();
    });
  };

  checkCurrentLayout = () => {
    if (this.loading) {
      console.log('Skip check... we are loading');
      return;
    }
    const component = getTemplateSrv().replace(this.props.options.component) ?? '';
    const { entityInfo } = this.state;
    if (entityInfo && component) {
      const componentInfo = entityInfo.Components[component];
      if (this.state.componentInfo !== componentInfo) {
        console.log('COMPONENT CHANGED', componentInfo, this.props.options.rules);
        this.setState({ componentInfo, component });

        const { rules } = this.props.options;
        const componentTypeId = componentInfo?.ComponentTypeId;
        if (componentTypeId && rules) {
          for (const rule of rules) {
            if (rule.componentTypeId === componentTypeId) {
              const query = doQueryUpdate(rule.actions);
              console.log('RULE MATCHED: ', rule, componentTypeId, query);
              if (rule.dashboard && rule.dashboard !== this.dashboardUid) {
                mergeDashboard(this.props.eventBus, rule.dashboard).then((v) => {
                  if (v) {
                    this.dashboardUid = rule.dashboard!;
                  }
                });
              }
              break;
            }
          }
        }
      } else {
        console.log('SAME SAME', component, componentInfo, entityInfo);
      }
    }
  };

  componentDidUpdate(oldProps: Props, oldState: State) {
    const { options } = this.props;
    const templateSrv = getTemplateSrv();
    const entityId = templateSrv.replace(options.entityId) ?? '';
    const component = templateSrv.replace(options.component) ?? '';
    if (options.datasource !== oldProps.options.datasource) {
      this.setState({ entityId, component });
      this.initWorkspace();
      return;
    }
    if (entityId !== this.state.entityId) {
      this.setState({ entityId, component });
      this.updateEntryInfo(entityId);
      return;
    }
    if (component !== this.state.component) {
      this.setState({ component });
      this.checkCurrentLayout();
    }
  }

  /**
   * Example implementaiton within a panel
   */
  twinMakerPanelQueryRunner = (query: TwinMakerPanelQuery, options: BaseDataQueryOptions) => {
    if (!query.topic) {
      return of({ error: { message: 'missing topic' }, data: [] });
    }

    switch (query.topic) {
      // Streaming result
      case TwinMakerPanelTopic.VisibleComponents:
        return this.visSim;

      // Delegate the query elsewhere
      case TwinMakerPanelTopic.SelectedItem: {
        if (!this.ds) {
          return throwError(() => `datasource not configured yet?`);
        }
        return this.ds!.query({
          ...options,
          targets: [
            {
              ...query,
              refId: query.refId,
              ...twinMakerQueries[this.state.twinMakerQueryIndex],
            } as any,
          ],
        });
      }

      // Simple results
      case TwinMakerPanelTopic.VisibleAnchors: {
        const data = new ArrayDataFrame([
          { name: 'spot 0', link: 'aaa,bbb,cc' },
          { name: 'spot 1', link: 'aaa,bbb,cc' },
          { name: 'spot 2', link: 'aaa,bbb,cc' },
          { name: 'spot 3', link: 'aaa,bbb,cc' },
          { name: 'spot 4', link: 'aaa,bbb,cc' },
        ]);
        return of({
          data: [data],
        });
      }
    }

    return throwError(() => `invalid content type`);
  };

  render() {
    const { options } = this.props;
    const { entityInfo, componentInfo } = this.state;
    if (this.error) {
      return <div>ERROR: {this.error}</div>;
    }

    switch (options.show) {
      case DisplayMode.EntityDetails:
        return (
          <CustomScrollbar autoHeightMin="100%">
            <div>
              <table>
                <tr>
                  <th>EntityName: &nbsp;</th>
                  <td>{entityInfo?.EntityName}</td>
                </tr>
                <tr>
                  <th>ComponentTypeId: &nbsp;</th>
                  <td>{componentInfo?.ComponentTypeId}</td>
                </tr>
              </table>
              {componentInfo && <pre>{JSON.stringify(componentInfo, null, 2)}</pre>}
              {entityInfo && !componentInfo && <pre>{JSON.stringify(entityInfo, null, 2)}</pre>}
            </div>
          </CustomScrollbar>
        );

      case DisplayMode.ComponentTypeId:
        return (
          <div>
            <p>Component: {componentInfo?.ComponentTypeId}</p>
          </div>
        );

      case DisplayMode.EntityName:
      default:
        return (
          <div>
            <p>Entity: {entityInfo?.EntityName}</p>
          </div>
        );
    }
  }
}
