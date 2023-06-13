import React, { useEffect, useState } from 'react';
import { onUpdateDatasourceJsonDataOption, SelectableValue, updateDatasourcePluginJsonDataOption } from '@grafana/data';
import { ConnectionConfig, ConnectionConfigProps } from '@grafana/aws-sdk';
import { FieldSet, InlineField, InlineFieldRow, Select, Input, Alert, Checkbox } from '@grafana/ui';
import { standardRegions } from '../regions';
import { TwinMakerDataSourceOptions, TwinMakerSecureJsonData } from '../types';
import { getTwinMakerDatasource } from 'common/datasourceSrv';
import { getSelectionInfo } from 'common/info/info';
import { SelectableQueryResults } from 'common/info/types';
import { useEffectOnce } from 'react-use';

type Props = ConnectionConfigProps<TwinMakerDataSourceOptions, TwinMakerSecureJsonData>;

export function ConfigEditor(props: Props) {
  const [alarmConfigChecked, setAlarmConfigChecked] = useState(!!props.options.jsonData.assumeRoleArnWriter);
  const [workspaces, setWorkspaces] = useState<SelectableQueryResults>([]);
  const [isWorkspacesMenuOpen, setIsWorkspacesMenuOpen] = useState(false);
  const [workspacesError, setWorkspacesError] = useState('');
  const [isLoadingWorkspaces, setLoadingWorkspaces] = useState(false);
  const [saved, setSaved] = useState(!!props.options.version && props.options.version > 1);

  useEffectOnce(() => {
    // Default to 'us-east-1'
    if (!props.options.jsonData?.defaultRegion) {
      updateDatasourcePluginJsonDataOption(props, 'defaultRegion', 'us-east-1');
    }
  });

  useEffect(() => {
    setSaved(false);
  }, [
    props.options.jsonData.assumeRoleArn,
    props.options.jsonData.authType,
    props.options.jsonData.assumeRoleArnWriter,
    props.options.jsonData.defaultRegion,
    props.options.jsonData.endpoint,
    props.options.jsonData.externalId,
    props.options.secureJsonData?.accessKey,
    props.options.secureJsonData?.secretKey,
  ]);

  useEffect(() => {
    props.options.version && setSaved(true);
    setWorkspacesError('');
  }, [props.options.version]);

  const onOpenHandler = () => {
    if (saved) {
      setWorkspaces([]);
      loadWorkspaces();
      setIsWorkspacesMenuOpen(true);
    } else {
      setWorkspacesError('Save the datasource first to load workspaces');
    }
  };

  const loadWorkspaces = async () => {
    setLoadingWorkspaces(true);
    const ds = await getTwinMakerDatasource(props.options.uid);
    if (ds) {
      try {
        const workspaces = await ds.info.listWorkspaces();
        setWorkspaces(workspaces);
      } catch (err) {
        setWorkspacesError('Error listing workspaces');
        console.log('Error listing workspaces....', err);
      }
      setLoadingWorkspaces(false);
    }
  };

  const onWorkspaceChange = (event: SelectableValue<string>) => {
    updateDatasourcePluginJsonDataOption(props, 'workspaceId', event?.value);
  };

  const onUnknownWorkspaceChange = (event: string) => {
    updateDatasourcePluginJsonDataOption(props, 'workspaceId', event);
  };

  const onAlarmCheckChange = (isChecked: boolean) => {
    setAlarmConfigChecked(isChecked);
    if (!isChecked) {
      updateDatasourcePluginJsonDataOption(props, 'assumeRoleArnWriter', undefined);
    }
  };

  const workspacesSelection = getSelectionInfo(props.options.jsonData.workspaceId, workspaces, undefined, true);

  return (
    <>
      <ConnectionConfig {...props} standardRegions={standardRegions} />

      {!props.options.jsonData.assumeRoleArn && (
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
          <InlineField label="Workspace" labelWidth={28} invalid={!!workspacesError} error={workspacesError}>
            <Select
              menuShouldPortal={true}
              value={workspacesSelection.current}
              options={workspacesSelection.options}
              className="width-30"
              onChange={onWorkspaceChange}
              isLoading={isLoadingWorkspaces}
              allowCustomValue={true}
              onCreateOption={onUnknownWorkspaceChange}
              formatCreateLabel={(v) => `WorkspaceID: ${v}`}
              isClearable={true}
              disabled={workspaces?.length === 0}
              placeholder="Select a workspace"
              noOptionsMessage="No workspaces found"
              onOpenMenu={onOpenHandler}
              onCloseMenu={() => setIsWorkspacesMenuOpen(false)}
              isOpen={isWorkspacesMenuOpen}
              invalid={!!workspacesError}
            />
          </InlineField>
        </InlineFieldRow>
        <Checkbox
          label={'Define write permissions for Alarm Configuration Panel'}
          value={alarmConfigChecked}
          onChange={(e) => onAlarmCheckChange(e.currentTarget.checked)}
        />
        {alarmConfigChecked && (
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
                value={props.options.jsonData.assumeRoleArnWriter || ''}
                onChange={onUpdateDatasourceJsonDataOption(props, 'assumeRoleArnWriter')}
              />
            </InlineField>
          </InlineFieldRow>
        )}
      </FieldSet>
    </>
  );
}
