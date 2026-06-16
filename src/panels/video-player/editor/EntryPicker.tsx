import React, { PureComponent } from 'react';
import { Select } from '@grafana/ui';
import { StandardEditorProps, SelectableValue } from '@grafana/data';

import { PanelOptions } from '../types';
import { TwinMakerDataSource } from 'datasource/datasource';
import { getTwinMakerDatasource } from 'common/datasourceSrv';
import { getSelectionInfo } from 'common/info/info';
import { SelectableComponentInfo, WorkspaceSelectionInfo } from 'common/info/types';
import { getVariableOptions } from 'common/variables';

export interface Settings {
  isComponentName: boolean;
  isKvsStreamName: boolean;
}

type Props = StandardEditorProps<string, Settings, PanelOptions>;

interface State {
  datasource?: TwinMakerDataSource;
  workspace?: WorkspaceSelectionInfo;
  workspaceLoading?: boolean;
  entity?: SelectableComponentInfo[];
  entityLoading?: boolean;
}

export class EntryPicker extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.initTwinMakerDatasource();
  }

  componentDidUpdate(prevProps: Props) {
    const options = this.props.context?.options;
    const prev = prevProps.context?.options;
    if (options?.datasource !== prev?.datasource) {
      this.initTwinMakerDatasource();
    } else if (this.props.item.settings?.isComponentName) {
      if (options?.entityId !== prev?.entityId) {
        this.initTwinMakerDatasource();
      }
    }
  }

  // Called when datasource changes (not often!)
  initTwinMakerDatasource = async () => {
    const options = this.props.context?.options;
    const ds = await getTwinMakerDatasource(options?.datasource);
    if (ds && ds.getWorkspaceId()) {
      try {
        const entityId = this.props.context?.options?.entityId;
        if (this.props.item.settings?.isComponentName) {
          if (entityId) {
            this.setState({ entityLoading: true });
            const entity = await ds.info.getEntityInfo(entityId);
            this.setState({
              datasource: ds,
              entity,
              entityLoading: false,
            });
          }
        } else {
          this.setState({ workspaceLoading: true });
          const workspace = await ds.info.getWorkspaceInfo();
          this.setState({
            datasource: ds,
            workspace,
            workspaceLoading: false,
          });
        }
      } catch (err: any) {
        err.isHandled = true;
      }
    } else {
      this.setState({
        datasource: ds,
      });
    }
  };

  onValuePicked = (event?: SelectableValue<string>) => {
    this.props.onChange(event?.value);
  };

  onValueTyped = (value: string) => {
    this.props.onChange(value);
  };

  render() {
    if (this.props.item.settings?.isKvsStreamName) {
      const kvsStreamName = getSelectionInfo(this.props.value, [], getVariableOptions());
      return (
        <Select
          menuShouldPortal={true}
          value={kvsStreamName.current}
          options={kvsStreamName.options}
          onChange={this.onValuePicked}
          isClearable={true}
          allowCustomValue={true}
          onCreateOption={this.onValueTyped}
          formatCreateLabel={(v) => `KVS stream name: ${v}`}
          placeholder="Select or type KVS stream name"
        />
      );
    }
    if (this.props.item.settings?.isComponentName) {
      const compName = getSelectionInfo(this.props.value, this.state?.entity, getVariableOptions());
      return (
        <Select
          menuShouldPortal={true}
          value={compName.current}
          options={compName.options}
          onChange={this.onValuePicked}
          isClearable={true}
          allowCustomValue={true}
          onCreateOption={this.onValueTyped}
          formatCreateLabel={(v) => `Component: ${v}`}
          isLoading={this.state.entityLoading}
          placeholder="Select or type Component name"
        />
      );
    }
    const entity = getSelectionInfo(this.props.value, this.state.workspace?.entities, getVariableOptions());
    return (
      <Select
        menuShouldPortal={true}
        value={entity.current}
        options={entity.options}
        onChange={this.onValuePicked}
        isClearable={true}
        allowCustomValue={true}
        onCreateOption={this.onValueTyped}
        formatCreateLabel={(v) => `EntityID: ${v}`}
        isLoading={this.state.workspaceLoading}
        placeholder="Select or type EntityID"
      />
    );
  }
}
