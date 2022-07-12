import defaults from 'lodash/defaults';

import React, { PureComponent } from 'react';
import {
  Alert,
  Icon,
  InlineField,
  InlineFieldRow,
  InlineSwitch,
  Input,
  LinkButton,
  MultiSelect,
  Select,
} from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { TwinMakerDataSource } from '../datasource';
import { defaultQuery, TwinMakerDataSourceOptions } from '../types';
import { TwinMakerApiModel } from 'aws-iot-twinmaker-grafana-utils';
import { changeQueryType, QueryTypeInfo, twinMakerOrderOptions, twinMakerQueryTypes } from 'datasource/queryInfo';
import { WorkspaceSelectionInfo, SelectableComponentInfo, SelectableQueryResults } from 'common/info/types';
import {
  ComponentFieldName,
  getMultiSelectionInfo,
  getSelectionInfo,
  resolvePropsFromComponentSel,
  SelectionInfo,
} from 'common/info/info';
import {
  getTwinMakerDashboardManager,
  isTwinMakerPanelQuery,
  TwinMakerPanelTopic,
  TwinMakerPanelTopicInfo,
  TwinMakerQueryType,
  TwinMakerQuery,
  TwinMakerResultOrder,
  TwinMakerPropertyFilter,
  DEFAULT_PROPERTY_FILTER_OPERATOR,
} from 'common/manager';
import { getTemplateSrv } from '@grafana/runtime';
import { getVariableOptions } from 'common/variables';
import FilterQueryEditor from './FilterQueryEditor';
import { BlurTextInput } from './BlurTextInput';

export const firstLabelWith = 18;

type Props = QueryEditorProps<TwinMakerDataSource, TwinMakerQuery, TwinMakerDataSourceOptions>;
interface State {
  templateVars?: Array<SelectableValue<string>>;
  workspace?: WorkspaceSelectionInfo;
  workspaceLoading?: boolean;
  entity?: SelectableComponentInfo[];
  entityLoading?: boolean;
  topics?: TwinMakerPanelTopicInfo[];
}

export class QueryEditor extends PureComponent<Props, State> {
  panels: Array<SelectableValue<number>>;

  constructor(props: Props) {
    super(props);
    this.panels = getTwinMakerDashboardManager().listTwinMakerPanels();
    this.state = {};
  }

  componentDidMount() {
    this.loadWorkspaceInfo();
    this.loadEntityInfo(this.props.query);
    this.loadTopicInfo(this.props.query);
    this.setState({ templateVars: getVariableOptions() });
  }

  loadWorkspaceInfo = async () => {
    const ds = this.props.datasource;
    if (ds) {
      try {
        this.setState({ workspaceLoading: true });
        const opts = await ds.info.getWorkspaceInfo();
        this.setState({ workspace: opts, workspaceLoading: false });
      } catch (ex) {
        console.log('Error listing options', ex);
      }
    }
  };

  loadEntityInfo = async (query: TwinMakerQuery) => {
    const { datasource } = this.props;
    if (datasource && query.entityId) {
      try {
        const entityId = getTemplateSrv().replace(query.entityId);
        this.setState({ entityLoading: true });
        const entityInfo = await datasource.info.getEntityInfo(entityId);
        this.setState({ entity: entityInfo, entityLoading: false });
      } catch (ex) {
        console.log('Error loading query.entityId', ex);
      }
    }
  };

  loadTopicInfo = async (query: TwinMakerQuery) => {
    if (isTwinMakerPanelQuery(query)) {
      try {
        this.setState({ topics: getTwinMakerDashboardManager().getQueryTopics(query.panelId) });
      } catch (ex) {
        console.log('Error loading query.entityId', ex);
      }
    }
  };

  onQueryTypeChange = (sel: SelectableValue<TwinMakerQueryType>) => {
    const { onChange, onRunQuery } = this.props;
    const query = changeQueryType(this.props.query, sel as QueryTypeInfo);
    onChange(query);
    onRunQuery();
    if (isTwinMakerPanelQuery(query)) {
      this.loadTopicInfo(query);
    }
  };

  onOrderChange = (event: SelectableValue<TwinMakerResultOrder>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, order: event?.value });
    onRunQuery();
  };

  onAlarmFilterChange = (event: SelectableValue<string>) => {
    const { onChange, query, onRunQuery } = this.props;
    const filter = event?.value
      ? [{ name: 'alarm_status', value: event.value, op: DEFAULT_PROPERTY_FILTER_OPERATOR }]
      : undefined;
    onChange({ ...query, filter });
    onRunQuery();
  };

  onEntityIdChange = (event: SelectableValue<string>) => {
    this.onEntityIdTextChange(event?.value);
  };

  onEntityIdTextChange = (entityId?: string) => {
    const { onChange, query, onRunQuery } = this.props;
    const copy = {
      ...query,
      entityId,
    };
    if (copy.queryType === TwinMakerQueryType.ComponentHistory) {
      delete copy.componentTypeId;
      delete copy.componentName;
      delete copy.properties;
      // TODO? enter defaults for them
    }
    onChange(copy);
    onRunQuery();
    this.loadEntityInfo(copy);
  };

  onComponentNameChange = (event: SelectableValue<string>) => {
    this.onComponentNameTextChange(event?.value);
  };

  onComponentNameTextChange = (componentName?: string) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({
      ...query,
      componentName,
    });
    onRunQuery();
  };

  onComponentTypeIdChange = (event: SelectableValue<string>) => {
    this.onComponentTypeIdTextChange(event?.value);
  };

  onComponentTypeIdTextChange = (componentTypeId?: string) => {
    const { onChange, query, onRunQuery } = this.props;
    const copy = {
      ...query,
      componentTypeId,
    };
    if (
      copy.queryType === TwinMakerQueryType.ComponentHistory ||
      copy.componentTypeId === TwinMakerQueryType.EntityHistory
    ) {
      delete copy.entityId;
      delete copy.componentName;
      delete copy.properties;

      const opts = this.state.workspace?.components;
      if (componentTypeId && opts) {
        const match = opts.find((v) => v.value === componentTypeId);
        if (match?.timeSeries?.length === 1) {
          copy.properties = [match.timeSeries[0].value!];
        }
      }
    }
    onChange(copy);
    onRunQuery();
  };

  onPanelChange = (event: SelectableValue<number>) => {
    const { onChange, onRunQuery } = this.props;
    const query = {
      ...this.props.query,
      queryType: TwinMakerQueryType.TwinMakerPanel,
      panelId: event?.value,
    };
    onChange(query);
    onRunQuery();
    this.loadTopicInfo(query);
  };

  onPanelTopicChange = (event: SelectableValue<TwinMakerPanelTopic>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({
      ...query,
      queryType: TwinMakerQueryType.TwinMakerPanel,
      topic: event?.value,
    } as any);
    onRunQuery();
  };

  onCustomPropertyAdded = (prop?: string) => {
    if (prop?.length) {
      const { onChange, query, onRunQuery } = this.props;
      const properties = query.properties ? [...query.properties] : [];
      properties.push(prop);
      onChange({
        ...query,
        properties,
      });
      onRunQuery();
    }
  };

  onPropertiesSelected = (sel: Array<SelectableValue<string>>) => {
    const { onChange, query, onRunQuery } = this.props;
    let properties: string[] = [];
    if (sel?.length) {
      properties = sel.map((v) => v.value as string);
    }
    onChange({
      ...query,
      properties,
    });
    onRunQuery();
  };

  onToggleStream = () => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, isStreaming: !query.isStreaming });
    onRunQuery();
  };

  onIntervalChange = (value?: string) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, intervalStreaming: value });
    onRunQuery();
  };
  renderEntitySelector(query: TwinMakerQuery, isClearable: boolean) {
    const entity = getSelectionInfo(query.entityId, this.state.workspace?.entities, this.state.templateVars);
    return (
      <InlineFieldRow key="entity-selector">
        <InlineField label={'Entity'} grow={true} labelWidth={firstLabelWith}>
          <Select
            menuShouldPortal={true}
            value={entity.current}
            options={entity.options}
            onChange={this.onEntityIdChange}
            isClearable={isClearable}
            allowCustomValue={true}
            onCreateOption={this.onEntityIdTextChange}
            formatCreateLabel={(v) => `EntityID: ${v}`}
            isLoading={this.state.workspaceLoading}
          />
        </InlineField>
      </InlineFieldRow>
    );
  }

  renderComponentTypeSelector(
    query: TwinMakerQuery,
    compType: SelectionInfo<string>,
    filter?: keyof SelectableComponentInfo
  ) {
    // Limit to things with `timeSeries` properties

    let placeholder = 'Select component type';
    if (filter) {
      compType.options = compType.options.filter((v) => v[filter]);
      if (!compType.options.length) {
        placeholder = `Enter value (no types with ${filter} found)`;
      }
    }
    return (
      <InlineFieldRow key="component-type">
        <InlineField label={'Component Type'} grow={true} labelWidth={firstLabelWith}>
          <Select
            menuShouldPortal={true}
            value={compType.current}
            options={compType.options}
            onChange={this.onComponentTypeIdChange}
            isClearable={true}
            isLoading={this.state.workspaceLoading}
            allowCustomValue={true}
            onCreateOption={this.onComponentTypeIdTextChange}
            formatCreateLabel={(v) => `Component Type: ${v}`}
            placeholder={placeholder}
          />
        </InlineField>
      </InlineFieldRow>
    );
  }

  renderComponentNameSelector(query: TwinMakerQuery, compName: SelectionInfo<string>, isClearable: boolean) {
    return (
      <InlineFieldRow>
        <InlineField label={'Component Name'} grow={true} labelWidth={firstLabelWith}>
          <Select
            menuShouldPortal={true}
            value={compName.current}
            options={compName.options}
            onChange={this.onComponentNameChange}
            isClearable={isClearable}
            isLoading={this.state.workspaceLoading}
            allowCustomValue={true}
            onCreateOption={this.onComponentNameTextChange}
            formatCreateLabel={(v) => `Component Name: ${v}`}
          />
        </InlineField>
        <InlineField label="Stream" tooltip="Polling data in an interval">
          <InlineSwitch value={Boolean(query.isStreaming)} onChange={this.onToggleStream} />
        </InlineField>
        <InlineField label="Interval" tooltip="Set an interval in seconds to poll data, minimum 5s">
          <BlurTextInput value={query.intervalStreaming} onChange={this.onIntervalChange} />
        </InlineField>
      </InlineFieldRow>
    );
  }

  renderAlarmFilterSelector(query: TwinMakerQuery, isClearable: boolean) {
    const alarmStatuses: Array<SelectableValue<string>> = [
      {
        label: TwinMakerApiModel.AlarmStatus.ACTIVE,
        value: TwinMakerApiModel.AlarmStatus.ACTIVE,
      },
      {
        label: TwinMakerApiModel.AlarmStatus.SNOOZE_DISABLED,
        value: TwinMakerApiModel.AlarmStatus.SNOOZE_DISABLED,
      },
      {
        label: TwinMakerApiModel.AlarmStatus.ACKNOWLEDGED,
        value: TwinMakerApiModel.AlarmStatus.ACKNOWLEDGED,
      },
      {
        label: TwinMakerApiModel.AlarmStatus.NORMAL,
        value: TwinMakerApiModel.AlarmStatus.NORMAL,
      },
    ];
    const current = query.filter?.length ? query.filter[0].value : undefined;
    const filter = getSelectionInfo(current, alarmStatuses);
    return (
      <InlineFieldRow>
        <InlineField label={'Filter'} grow={true} labelWidth={firstLabelWith}>
          <Select
            menuShouldPortal={true}
            value={filter.current}
            options={filter.options}
            onChange={this.onAlarmFilterChange}
            isClearable={isClearable}
          />
        </InlineField>
      </InlineFieldRow>
    );
  }

  onFilterChanged = (index: number, evt?: TwinMakerPropertyFilter) => {
    const { onChange, query } = this.props;
    const filter = query.filter ? query.filter.slice() : [];
    if (!evt) {
      if (query.filter) {
        filter.splice(index, 1);
        onChange({ ...query, filter });
        this.props.onRunQuery();
      }
      return;
    }

    // don't run the query -- this will fire often!
    filter[index] = evt;
    onChange({ ...query, filter });
  };

  onAddFilter = () => {
    const { onChange, query } = this.props;
    const filter = query.filter ? query.filter.slice() : [];
    filter.push({ name: '', op: DEFAULT_PROPERTY_FILTER_OPERATOR, value: '' });
    onChange({ ...query, filter });
  };

  renderPropsFilterSelector(query: TwinMakerQuery) {
    let filter = query.filter ?? [];
    if (!filter.length) {
      filter = [{ name: '', op: DEFAULT_PROPERTY_FILTER_OPERATOR, value: '' }];
    }

    return filter.map((f, index) => (
      <FilterQueryEditor
        key={`${index}/${f.name}`}
        index={index}
        filter={f}
        last={index >= filter.length - 1}
        onAdd={this.onAddFilter}
        onChange={this.onFilterChanged}
      />
    ));
  }

  renderPropsSelector(query: TwinMakerQuery, propOpts?: Array<SelectableValue<string>>, isLoading?: boolean) {
    if (!propOpts) {
      propOpts = [];
    }
    // make sure all selected properties are visible
    if (query.properties) {
      const all = new Set(propOpts.map((v) => v.value));
      for (const p of query.properties) {
        if (!all.has(p)) {
          propOpts = [
            ...propOpts,
            {
              value: p,
              label: `${p} (?)`,
            },
          ];
        }
      }
    }
    const properties = getMultiSelectionInfo(query.properties, propOpts, this.state.templateVars);
    return (
      <InlineFieldRow>
        <InlineField label={'Selected Properties'} grow={true} labelWidth={firstLabelWith}>
          <MultiSelect
            menuShouldPortal={true}
            value={properties.current}
            options={properties.options}
            onChange={this.onPropertiesSelected}
            isLoading={isLoading}
            allowCustomValue={true}
            onCreateOption={this.onCustomPropertyAdded}
            formatCreateLabel={(v) => `Property: ${v}`}
            placeholder="Type or select properties"
          />
        </InlineField>
      </InlineFieldRow>
    );
  }

  renderQuery(query: TwinMakerQuery) {
    if (isTwinMakerPanelQuery(query)) {
      if (!this.panels.length) {
        return (
          <Alert title="No TwinMaker panels in the dashbaord" severity="warning">
            This query type will listen for actions within a panel, however the dashboard does not contain any
            configured panels.
          </Alert>
        );
      }
      const panelSel = getSelectionInfo(query.panelId, this.panels);
      const topicSel = getSelectionInfo(query.topic, this.state.topics);
      const compName = getSelectionInfo(query.componentName, this.state.entity, this.state.templateVars);
      return (
        <>
          <InlineFieldRow>
            <InlineField label={'Panel'} labelWidth={firstLabelWith} grow={true}>
              <Select
                menuShouldPortal={true}
                value={panelSel.current}
                options={panelSel.options}
                onChange={this.onPanelChange}
                isClearable={true}
                placeholder={`Select TwinMaker panel`}
              />
            </InlineField>
            <InlineField label={'Topic'}>
              <Select
                menuShouldPortal={true}
                value={topicSel.current}
                options={topicSel.options}
                onChange={this.onPanelTopicChange}
                width={16}
              />
            </InlineField>
          </InlineFieldRow>
          {panelSel.current?.showPartialQuery ||
            (query.topic === TwinMakerPanelTopic.SelectedItem && (
              <>
                {this.renderEntitySelector(query, true)}
                {this.renderComponentNameSelector(query, compName, true)}
                {this.renderPropsSelector(query, this.state.workspace?.properties, this.state.workspaceLoading)}
              </>
            ))}
        </>
      );
    }
    const compType = getSelectionInfo(query.componentTypeId, this.state.workspace?.components, this.state.templateVars);

    const { entity: entityInfo } = this.state;
    switch (query.queryType) {
      case TwinMakerQueryType.ListWorkspace:
      case TwinMakerQueryType.ListScenes:
        return null; // nothing required
      case TwinMakerQueryType.GetAlarms:
        return this.renderAlarmFilterSelector(query, true);
      case TwinMakerQueryType.ListEntities:
        return this.renderComponentTypeSelector(query, compType);
      case TwinMakerQueryType.GetEntity:
        return this.renderEntitySelector(query, false);
      case TwinMakerQueryType.GetPropertyValue:
        if (query.entityId) {
          const compName = getSelectionInfo(query.componentName, entityInfo, this.state.templateVars);
          const propOpts = resolvePropsFromComponentSel(compName, ComponentFieldName.props, entityInfo);
          return (
            <>
              {this.renderEntitySelector(query, true)}
              {this.renderComponentNameSelector(query, compName, true)}
              {this.renderPropsSelector(query, propOpts)}
            </>
          );
        }
        return this.renderEntitySelector(query, true);
      case TwinMakerQueryType.EntityHistory: {
        const compName = getSelectionInfo(query.componentName, entityInfo, this.state.templateVars);
        const propOpts = resolvePropsFromComponentSel(compName, ComponentFieldName.timeSeries, entityInfo);
        return (
          <>
            {this.renderEntitySelector(query, true)}
            {this.renderComponentNameSelector(query, compName, true)}
            {this.renderPropsSelector(query, propOpts)}
            {this.renderPropsFilterSelector(query)}
          </>
        );
      }
      case TwinMakerQueryType.ComponentHistory: {
        const propOpts = compType.current?.timeSeries as SelectableQueryResults;
        return (
          <>
            {this.renderComponentTypeSelector(query, compType, 'timeSeries')}
            {this.renderPropsSelector(query, propOpts)}
            {this.renderPropsFilterSelector(query)}
          </>
        );
      }
    }
    return <div>Missing UI for query type: {query.queryType}</div>;
  }

  render() {
    const query = defaults(this.props.query, defaultQuery);

    const currentQueryType = twinMakerQueryTypes.find((v) => v.value === query.queryType);
    const queryTooltip = currentQueryType ? (
      <div>
        {currentQueryType.description}
        {currentQueryType.helpURL && false && (
          <div>
            <LinkButton href={currentQueryType?.helpURL} target="_blank">
              API Docs <Icon name="external-link-alt" />
            </LinkButton>
          </div>
        )}
      </div>
    ) : undefined;

    const sortable =
      query.queryType === TwinMakerQueryType.ComponentHistory || query.queryType === TwinMakerQueryType.EntityHistory;

    return (
      <div className={'gf-form-group'}>
        <InlineFieldRow>
          <InlineField label="Query Type" labelWidth={firstLabelWith} grow={true} tooltip={queryTooltip}>
            <Select
              menuShouldPortal={true}
              options={twinMakerQueryTypes}
              value={currentQueryType}
              onChange={this.onQueryTypeChange}
              placeholder="Select query type"
              menuPlacement="bottom"
            />
          </InlineField>
          {sortable && (
            <InlineField label="Order">
              <Select
                menuShouldPortal={true}
                options={twinMakerOrderOptions}
                value={twinMakerOrderOptions.find((v) => v.value === query.order)}
                onChange={this.onOrderChange}
                placeholder="default"
                isClearable
                width={12}
              />
            </InlineField>
          )}
        </InlineFieldRow>

        {this.renderQuery(query)}
      </div>
    );
  }
}
