import React, { PureComponent } from 'react';
import { onUpdateDatasourceJsonDataOption, SelectableValue, updateDatasourcePluginJsonDataOption } from '@grafana/data';
import { ConnectionConfig, ConnectionConfigProps } from '@grafana/aws-sdk';
import { FieldSet, InlineField, InlineFieldRow, Select, Input, Alert, Checkbox } from '@grafana/ui';
import { standardRegions } from '../regions';
import { TwinMakerDataSourceOptions, TwinMakerSecureJsonData } from '../types';
import { getTwinMakerDatasource } from 'common/datasourceSrv';
import { getSelectionInfo } from 'common/info/info';
import { SelectableQueryResults } from 'common/info/types';

type Props = ConnectionConfigProps<TwinMakerDataSourceOptions, TwinMakerSecureJsonData>;

interface State {
  workspaces?: SelectableQueryResults;
  alarmConfigChecked?: boolean;
}

export class ConfigEditor extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { alarmConfigChecked: !!this.props.options.jsonData.assumeRoleArnWriter };
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
        this.setState({ ...this.state, workspaces });
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

  onAlarmCheckChange = (event: boolean) => {
    this.setState({ ...this.state, alarmConfigChecked: event });
  };

  render() {
    const workspaces = getSelectionInfo(this.props.options.jsonData.workspaceId, this.state.workspaces);
    const hasWorkspaces = Boolean(this.state.workspaces?.length);
    const arn = this.props.options.jsonData.assumeRoleArn;
    const arnWriter = this.props.options.jsonData.assumeRoleArnWriter;

    return (
      <>
        <ConnectionConfig {...this.props} standardRegions={standardRegions} />

        {!arn && (
          <Alert title="Assume Role ARN" severity="error" style={{ width: 700 }}>
            Specify an IAM role to narrow the permission scope of this datasource. Follow the documentation{' '}
            <a
              href="https://docs.aws.amazon.com/iot-twinmaker/latest/guide/dashboard-IAM-role.html"
              target="_blank"
              rel="noreferrer noopener"
            >
              here
            </a>{' '}
            to create policies and a role with minimal permissions for your TwinMaker workspace.
          </Alert>
        )}

        <FieldSet label={'TwinMaker settings'} data-testid="twinmaker-settings">
          <InlineFieldRow>
            <InlineField label="Workspace" labelWidth={28}>
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
          <Checkbox
            label={'Define write permissions for Alarm Configuration Panel'}
            value={this.state.alarmConfigChecked}
            onChange={(e) => this.onAlarmCheckChange(e.currentTarget.checked)}
          />
          {this.state.alarmConfigChecked && (
            <InlineFieldRow>
              <InlineField
                label="Assume Role ARN Write"
                labelWidth={28}
                tooltip="Specify the ARN of a role to assume when writing property values in IoT TwinMaker"
              >
                <Input
                  aria-label="Assume Role ARN Write"
                  className="width-30"
                  placeholder="arn:aws:iam:*"
                  value={arnWriter || ''}
                  onChange={onUpdateDatasourceJsonDataOption(this.props, 'assumeRoleArnWriter')}
                />
              </InlineField>
            </InlineFieldRow>
          )}
        </FieldSet>
      </>
    );
  }
}
