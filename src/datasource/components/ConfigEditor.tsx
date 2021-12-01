import React, { PureComponent } from 'react';
import { SelectableValue, updateDatasourcePluginJsonDataOption } from '@grafana/data';
import { ConnectionConfig, ConnectionConfigProps } from '@grafana/aws-sdk';
import { FieldSet, InlineField, InlineFieldRow, Select, Input, Alert } from '@grafana/ui';
import { standardRegions } from '../regions';
import { TwinMakerDataSourceOptions, TwinMakerSecureJsonData } from '../types';
import { getTwinMakerDatasource } from 'common/datasourceSrv';
import { getSelectionInfo } from 'common/info/info';
import { SelectableQueryResults } from 'common/info/types';

type Props = ConnectionConfigProps<TwinMakerDataSourceOptions, TwinMakerSecureJsonData>;

interface State {
  workspaces?: SelectableQueryResults;
}

export class ConfigEditor extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
    this.loadWorkspaces();
  }

  loadWorkspaces = async () => {
    const { options } = this.props;

    // Default to 'us-east-1'
    if (!options.jsonData?.defaultRegion) {
      updateDatasourcePluginJsonDataOption(this.props, 'defaultRegion', 'us-east-1');
    }

    const ds = await getTwinMakerDatasource(options.uid);
    if (ds) {
      try {
        const workspaces = await ds.info.listWorkspaces();
        this.setState({ workspaces });
      } catch (err) {
        console.log('Error listing workspaces....', err);
      }
    }
  };

  componentDidUpdate(oldProps: Props) {
    if (this.props.options !== oldProps.options) {
      this.loadWorkspaces();
    }
  }

  onWorkspaceChange = (event: SelectableValue<string>) => {
    updateDatasourcePluginJsonDataOption(this.props, 'workspaceId', event?.value);
  };

  onUnknownWorkspaceChange = (event: string) => {
    updateDatasourcePluginJsonDataOption(this.props, 'workspaceId', event);
  };

  render() {
    const workspaces = getSelectionInfo(this.props.options.jsonData.workspaceId, this.state.workspaces);
    const hasWorkspaces = Boolean(this.state.workspaces?.length);
    const arn = this.props.options.jsonData.assumeRoleArn;

    return (
      <>
        <ConnectionConfig {...this.props} standardRegions={standardRegions} />

        {!arn && (
          <Alert title="Assume Role ARN" severity="warning" style={{ width: 700 }}>
            This datasource will use the credentials directly from your authentication provider which may be a security
            risk. Specify an IAM role to narrow the permission scope of this datasource. Follow the documentation{' '}
            <a href="#" onClick={() => alert('TODO!')}>
              here
            </a>{' '}
            to create policies and a role with minimal permissions for your TwinMaker workspace.
          </Alert>
        )}

        <FieldSet label={'TwinMaker settings'} data-testid="twinmaker-settings">
          <InlineFieldRow>
            <InlineField label="Workspace" labelWidth={16}>
              <>
                {hasWorkspaces && (
                  <Select
                    menuShouldPortal={true}
                    value={workspaces.current}
                    options={workspaces.options}
                    className="width-30"
                    onChange={this.onWorkspaceChange}
                    allowCustomValue={true}
                    onCreateOption={this.onUnknownWorkspaceChange}
                    formatCreateLabel={(v) => `WorkspaceID: ${v}`}
                    isClearable={true}
                  />
                )}
                {!hasWorkspaces && (
                  <Input
                    className="width-30"
                    onBlur={(e) => this.onUnknownWorkspaceChange(e.currentTarget.value)}
                    defaultValue={this.props.options.jsonData.workspaceId}
                    placeholder={'enter workspace ID'}
                  />
                )}
              </>
            </InlineField>
          </InlineFieldRow>
        </FieldSet>
      </>
    );
  }
}
