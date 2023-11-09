import React from 'react';
import { TwinMakerQueryType } from 'common/manager';
import { QueryEditor } from './';
import { render, screen, waitFor } from '@testing-library/react';
import { DataSourceInstanceSettings } from '@grafana/data';
import { TwinMakerDataSourceOptions } from 'datasource/types';
import { TwinMakerDataSource } from 'datasource/datasource';
import { of } from 'rxjs';
import userEvent from '@testing-library/user-event';
import { config } from '@grafana/runtime';
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
const originalFormFeatureToggleValue = config.featureToggles.awsDatasourcesNewFormStyling;
const cleanup = () => {
  config.featureToggles.awsDatasourcesNewFormStyling = originalFormFeatureToggleValue;
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
              value: 'propGroup1',
              label: 'propgroup1',
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
  getGrafanaLiveSrv: () => ({ getConnectionState: jest.fn(() => of(true)) }),
  getTemplateSrv: () => ({
    getVariables: () => [],
    replace: (v: string) => v,
  }),
  config: {
    featureToggles: {
      awsDatasourcesNewFormStyling: true,
    },
  },
}));
const defaultProps = {
  datasource: new TwinMakerDataSource(instanceSettings),
  query: { grafanaLiveEnabled: false, propertyDisplayNames: { property: 'Prop name' }, refId: 'A' },
  onRunQuery: jest.fn(),
  onChange: jest.fn(),
};

describe('QueryEditor', () => {
  function run() {
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
    ])('Renders all necessary fields when Twinmaker Query Type is %s', async (type, expected, queryOptions) => {
      const props = {
        ...defaultProps,
        query: {
          ...defaultProps.query,
          ...queryOptions,
          queryType: type,
          grafanLiveEnabled: true,
        },
      };
      render(<QueryEditor {...props} />);
      if (config.featureToggles.awsDatasourcesNewFormStyling) {
        await openFormatCollapse();
      }
      
      for (const field of expected) {
        // if newFormStyling is enabled, the Format section is hidden under a Collapse
        waitFor(() => screen.getByText(field));
      }
    });
  }
  describe('QueryEditor with awsDatasourcesNewFormStyling feature toggle disabled', () => {
    beforeAll(() => {
      config.featureToggles.awsDatasourcesNewFormStyling = false;
    });
    afterAll(() => {
      cleanup();
    });
    run();
  });
  describe('QueryEditor with awsDatasourcesNewFormStyling feature toggle enabled', () => {
    beforeAll(() => {
      config.featureToggles.awsDatasourcesNewFormStyling = true;
    });
    afterAll(() => {
      cleanup();
    });
    run();
  });
});
async function openFormatCollapse() {
  const collapseLabel = await screen.queryByTestId('collapse-title');
  if (collapseLabel) {
    return userEvent.click(collapseLabel);
  }
}
