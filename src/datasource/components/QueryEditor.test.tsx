import React from 'react';
import { TwinMakerQueryType } from 'common/manager';
import { QueryEditor } from './';
import { render, screen, waitFor } from '@testing-library/react';
import { DataSourceInstanceSettings } from '@grafana/data';
import { TwinMakerDataSourceOptions } from 'datasource/types';
import { TwinMakerDataSource } from 'datasource/datasource';
import { of } from 'rxjs';
import userEvent from '@testing-library/user-event';
import { SelectableComponentInfo } from 'common/info/types';
const instanceSettings: DataSourceInstanceSettings<TwinMakerDataSourceOptions> = {
  id: 0,
  uid: 'test',
  name: 'twinmaker',
  type: 'datasource',
  access: 'direct',
  url: 'http://localhost',
  database: '',
  basicAuth: '',
  isDefault: false,
  jsonData: {},
  readOnly: false,
  withCredentials: false,
  meta: {} as any,
};

Promise.resolve([{ value: 'test1', label: 'test1' }]);
jest.mock('common/info/info', () => ({
  ...jest.requireActual('common/info/info'),

  getCachingWorkspaceInfoSupplier: () => ({
    listWorkspaces: () => jest.fn(),
    listScenes: () => jest.fn(),
    getWorkspaceInfo: () => jest.fn(),
    getEntityInfo: (): SelectableComponentInfo => {
      return Promise.resolve([
        {
          value: 'mockEntity',
          label: 'mockEntity',
          propGroups: [
            {
              value: 'prop-Group-1',
              label: 'prop group1',
              props: [{ value: 'prop1', label: 'prop1' }],
            },
          ],
        },
      ]);
    },
    getEntity: Promise.resolve([{ value: 'mockEntity', label: 'mockEntity' }]),
    getWorkspace: () => jest.fn(),
    getToken: () => jest.fn(),
  }),
  getTwinMakerWorkspaceInfoSupplier: jest.fn(),
}));
jest.mock('common/dashboard', () => ({
  getCurrentDashboard: jest.fn().mockReturnValue(undefined),
}));
jest.mock('@grafana/runtime', () => ({
  ...jest.requireActual('@grafana/runtime'),
  // enable grafanaLive (by default)
  getGrafanaLiveSrv: () => ({ getConnectionState: jest.fn(() => of(false)) }),
  getTemplateSrv: () => ({
    getVariables: () => [],
    replace: (v: string) => v,
  }),
}));
const getDatasource = (grafanaLive: boolean) => {
  const ds = new TwinMakerDataSource(instanceSettings);
  ds.grafanaLiveEnabled = grafanaLive;
  return ds;
};
const getDefaultProps = (grafanaLive: boolean) => ({
  datasource: getDatasource(grafanaLive),
  query: { grafanaLiveEnabled: false, propertyDisplayNames: { property: 'Prop name' }, refId: 'A' },
  onRunQuery: jest.fn(),
  onChange: jest.fn(),
});

describe('QueryEditor', () => {
  it.each([
    [TwinMakerQueryType.GetAlarms, ['Filter', 'Max. Alarms', 'Interval', 'Stream'], {}],
    [TwinMakerQueryType.ListEntities, ['Component Type'], { isStreaming: true }],
    [TwinMakerQueryType.GetEntity, ['Entity'], {}],

    [
      TwinMakerQueryType.GetPropertyValue,
      ['Entity', 'Component Name', 'Selected Properties', 'Filter', 'Order By'],
      { isStreaming: true, componentName: 'mockEntity', entityId: 'mockEntity', propertyGroupName: 'propGroup1' },
    ],
    [
      TwinMakerQueryType.EntityHistory,
      ['Entity', 'Component Name', 'Selected Properties', 'Filter', 'Interval', 'Stream', 'Order'],
      {},
    ],
    [
      TwinMakerQueryType.ComponentHistory,
      ['Component Type', 'Selected Properties', 'Filter', 'Interval', 'Stream', 'Order'],
      {},
    ],
  ])(
    'Renders all necessary fields when Twinmaker Query Type is %s and grafanaLive enabled',
    async (type, expected, queryOptions) => {
      const defaultProps = getDefaultProps(true);
      const props = {
        ...defaultProps,
        query: {
          ...defaultProps.query,
          ...queryOptions,
          queryType: type,
        },
      };
      render(<QueryEditor {...props} />);
      waitFor(() => {
        openFormatCollapse();
      });
      for (const field of expected) {
        await waitFor(() => expect(screen.getByText(field)).toBeInTheDocument());
      }
    }
  );
  it.each([
    [TwinMakerQueryType.GetAlarms, ['Filter', 'Max. Alarms'], {}],
    [TwinMakerQueryType.ListEntities, ['Component Type'], { isStreaming: true }],
    [TwinMakerQueryType.GetEntity, ['Entity'], {}],

    [
      TwinMakerQueryType.GetPropertyValue,
      ['Entity', 'Component Name', 'Selected Properties', 'Filter', 'Order By'],
      { isStreaming: true, componentName: 'mockEntity', entityId: 'mockEntity', propertyGroupName: 'propGroup1' },
    ],
    [TwinMakerQueryType.EntityHistory, ['Entity', 'Component Name', 'Selected Properties', 'Filter', 'Order'], {}],
    [TwinMakerQueryType.ComponentHistory, ['Component Type', 'Selected Properties', 'Filter', 'Order'], {}],
  ])(
    'Renders all necessary fields when Twinmaker Query Type is %s and grafanaLive disabled',
    async (type, expected, queryOptions) => {
      const defaultProps = getDefaultProps(false);
      const props = {
        ...defaultProps,
        query: {
          ...defaultProps.query,
          ...queryOptions,
          queryType: type,
        },
      };
      render(<QueryEditor {...props} />);
      waitFor(() => {
        openFormatCollapse();
      });
      for (const field of expected) {
        await waitFor(() => screen.getByText(field));
      }
    }
  );
});
async function openFormatCollapse() {
  const collapseLabel = await screen.queryByTestId('collapse-title');
  if (collapseLabel) {
    return userEvent.click(collapseLabel);
  }
}
