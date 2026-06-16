import '@testing-library/jest-dom';
import React from 'react';
import { ConfigEditor } from './ConfigEditor';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataSourceSettings } from '@grafana/data';
import { TwinMakerDataSourceOptions, TwinMakerSecureJsonData } from 'datasource/types';

const datasourceOptions: DataSourceSettings<TwinMakerDataSourceOptions, TwinMakerSecureJsonData> = {
  id: 0,
  uid: 'test',
  orgId: 0,
  name: 'twinmaker',
  typeLogoUrl: '',
  type: 'datasource',
  typeName: 'Datasource',
  access: 'server',
  url: 'http://localhost',
  user: '',
  database: '',
  basicAuth: false,
  basicAuthUser: '',
  isDefault: false,
  jsonData: {},
  readOnly: false,
  withCredentials: false,
  secureJsonFields: {},
};
const workspacesMock = jest.fn(() => Promise.resolve([{ value: 'test1', label: 'test1' }]));

jest.mock('common/datasourceSrv', () => ({
  ...jest.requireActual('common/datasourceSrv'),
  getTwinMakerDatasource: jest.fn(() => ({
    info: {
      listWorkspaces: workspacesMock,
    },
  })),
}));

function setup() {
  return {
    user: userEvent.setup(),
    ...render(<ConfigEditor onOptionsChange={() => {}} options={datasourceOptions} />),
  };
}

const resetWindow = () => {
  (window as any).grafanaBootData = {
    settings: {},
  };
};

describe('ConfigEditor', () => {
  beforeEach(() => resetWindow());
  it('should display an error if the datasource is not saved', async () => {
    const { rerender, user } = setup();
    const rerenderOptions = {
      ...datasourceOptions,
      jsonData: {
        assumeRoleArn: 'test_2',
      },
    };
    rerender(<ConfigEditor options={rerenderOptions} onOptionsChange={() => {}} />);
    const dropdown = screen.getByText('Select a workspace');
    await user.click(dropdown);
    const error = await screen.findByText('Save the datasource first to load workspaces');
    expect(error).toBeInTheDocument();
    expect(workspacesMock).not.toHaveBeenCalled();
  });
  it('should remove the error when the datasource is saved', async () => {
    const { rerender, user } = setup();
    const rerenderOptions = {
      ...datasourceOptions,
      jsonData: {
        assumeRoleArn: 'test_2',
      },
    };
    rerender(<ConfigEditor options={rerenderOptions} onOptionsChange={() => {}} />);
    const dropdown = screen.getByText('Select a workspace');
    await user.click(dropdown);
    const error = await screen.findByText('Save the datasource first to load workspaces');
    expect(error).toBeInTheDocument();
    rerender(<ConfigEditor options={{ ...rerenderOptions, version: 2 }} onOptionsChange={() => {}} />);
    waitFor(() => expect(error).not.toBeInTheDocument());
  });
});
