import defaults from 'lodash/defaults';
import React, { PureComponent } from 'react';
import { Icon, Input, LinkButton, MultiSelect, Select, Switch } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { TwinMakerDataSource } from '../datasource';
import { defaultQuery, TwinMakerDataSourceOptions } from '../types';
import { TwinMakerApiModel } from 'aws-iot-twinmaker-grafana-utils';
import { changeQueryType, QueryTypeInfo, twinMakerQueryTypes } from 'datasource/queryInfo';
import {
  WorkspaceSelectionInfo,
  SelectableComponentInfo,
  SelectableQueryResults,
  SelectablePropGroupsInfo,
} from 'common/info/types';
import {
  ComponentFieldName,
  getMultiSelectionInfo,
  getSelectionInfo,
  resolvePropGroups,
  resolvePropsFromComponentSel,
  SelectionInfo,
} from 'common/info/info';
import {
  TwinMakerQueryType,
  TwinMakerQuery,
  TwinMakerResultOrder,
  TwinMakerPropertyFilter,
  DEFAULT_PROPERTY_FILTER_OPERATOR,
  TwinMakerOrderBy,
} from 'common/manager';
import { getTemplateSrv } from '@grafana/runtime';
import { getVariableOptions } from 'common/variables';
import FilterQueryEditor from './FilterQueryEditor';
import { BlurTextInput } from './BlurTextInput';
import OrderByEditor from './OrderByEditor';
import { EditorField, EditorFieldGroup, EditorRow, EditorRows } from '@grafana/plugin-ui';
import { css } from '@emotion/css';
import { QueryOptions } from './QueryOptions';

export const firstLabelWidth = 18;

type Props = QueryEditorProps<TwinMakerDataSource, TwinMakerQuery, TwinMakerDataSourceOptions>;
interface State {
  templateVars?: Array<SelectableValue<string>>;
  workspace?: WorkspaceSelectionInfo;
  workspaceLoading?: boolean;
  entity?: SelectableComponentInfo[];
  entityLoading?: boolean;
  invalidInterval?: boolean;
  hasStreaming?: boolean;
}

export class QueryEditor extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      invalidInterval: false,
    };
  }

  componentDidMount() {
    this.loadWorkspaceInfo();
    this.loadEntityInfo(this.props.query);
    this.setState({ templateVars: getVariableOptions({ keepVarSyntax: true }) });
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

  onQueryTypeChange = (sel: SelectableValue<TwinMakerQueryType>) => {
    const { onChange, onRunQuery } = this.props;
    const query = changeQueryType(this.props.query, sel as QueryTypeInfo);
    onChange(query);
    onRunQuery();
  };

  onOrderChange = (event: SelectableValue<TwinMakerResultOrder>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, order: event?.value });
    onRunQuery();
  };

  onAlarmFilterChange = (event: SelectableValue<string>) => {
    const { onChange, query, onRunQuery } = this.props;
    const filter = event?.value
      ? [
          {
            name: 'alarm_status',
            value: {
              stringValue: event.value,
            },
            op: DEFAULT_PROPERTY_FILTER_OPERATOR,
          },
        ]
      : undefined;
    onChange({ ...query, filter });
    onRunQuery();
  };

  onMaxResultsChange = (event: any) => {
    const { onChange, query, onRunQuery } = this.props;
    // set default maxResults to 50
    const maxResults = event.target.valueAsNumber ?? 50;
    if (maxResults !== 0) {
      onChange({ ...query, maxResults });
      onRunQuery();
    }
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
    let propertyDisplayNames: { [key: string]: string } = {};
    if (sel?.length) {
      sel.forEach((v) => {
        const propertyName = v.value as string;
        properties.push(propertyName);
        if (v.label && v.label !== v.value) {
          propertyDisplayNames[propertyName] = v.label;
        }
      });
    }
    onChange({
      ...query,
      properties,
      propertyDisplayNames,
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
    // not sending input less than 5 secs
    if (value?.length && +value < 5) {
      this.setState({ invalidInterval: true });
    } else {
      this.setState({ invalidInterval: false });
    }
    onChange({
      ...query,
      intervalStreaming: value,
    });
    onRunQuery();
  };

  renderEntitySelector(query: TwinMakerQuery, isClearable: boolean) {
    const entity = getSelectionInfo(query.entityId, this.state.workspace?.entities, this.state.templateVars);
    return (
      <EditorField label="Entity" className={editorFieldStyles} width={30} htmlFor="entity">
        <Select
          id="entity"
          aria-label="Entity"
          width={30}
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
      </EditorField>
    );
  }

  renderComponentTypeSelector(
    query: TwinMakerQuery,
    compType: SelectionInfo<string>,
    filter?: keyof SelectableComponentInfo,
    isStreaming?: boolean
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
      <EditorField label="Component Type" className={editorFieldStyles} width={20} htmlFor="component-type">
        <Select
          id="component-type"
          aria-label="Component Type"
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
      </EditorField>
    );
  }

  renderComponentNameSelector(
    query: TwinMakerQuery,
    compName: SelectionInfo<string>,
    isClearable: boolean,
    isStreaming?: boolean
  ) {
    return (
      <EditorField label="Component Name" width={15} className={editorFieldStyles} htmlFor="component-name">
        <Select
          id="component-name"
          aria-label="Component Name"
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
      </EditorField>
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
    const current = query.filter?.length ? query.filter[0].value.stringValue : undefined;
    const filter = getSelectionInfo(current, alarmStatuses);
    return (
      <EditorField label="Filter" className={editorFieldStyles} width={20} htmlFor="filter">
        <Select
          id="filter"
          aria-label="filter"
          menuShouldPortal={true}
          value={filter.current}
          options={filter.options}
          onChange={this.onAlarmFilterChange}
          isClearable={isClearable}
        />
      </EditorField>
    );
  }

  renderStreamingInputs(query: TwinMakerQuery) {
    if (!this.props.datasource.grafanaLiveEnabled) {
      return null;
    }
    return (
      <>
        <EditorField
          label="Stream"
          tooltip="Polling data in an interval"
          width={10}
        >
          <Switch value={Boolean(query.isStreaming)} onChange={this.onToggleStream} />
        </EditorField>
        <EditorField
          label="Interval"
          width={5}
          htmlFor="interval"
          tooltip="Set an interval in seconds to stream data, min 5s, default 30s"
          error={this.state.invalidInterval && 'Interval must be at least 5s'}
          invalid={this.state.invalidInterval}
        >
          <BlurTextInput
            id="interval"
            placeholder="30"
            value={query.intervalStreaming ?? ''}
            onChange={this.onIntervalChange}
            numeric={true}
          />
        </EditorField>
      </>
    );
  }

  renderAlarmMaxResultsInput(query: TwinMakerQuery) {
    return (
      <EditorField
        label="Max. Alarms"
        tooltip="Leave this field blank to return all results"
        className={editorFieldStyles}
        width={5}
      >
        <Input
          className="width-5"
          value={query.maxResults && query.maxResults > 0 ? query.maxResults : ''}
          type="number"
          onChange={this.onMaxResultsChange}
          placeholder="50"
          min="1"
        />
      </EditorField>
    );
  }

  getPropertiesMultiSelectionInfo(query: TwinMakerQuery, propOpts?: Array<SelectableValue<string>>) {
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

    return getMultiSelectionInfo(query.properties, propOpts, this.state.templateVars);
  }

  renderPropsSelector(query: TwinMakerQuery, propOpts?: Array<SelectableValue<string>>, isLoading?: boolean) {
    const properties = this.getPropertiesMultiSelectionInfo(query, propOpts);
    return (
      <EditorField label="Selected Properties" className={editorFieldStyles} width={20} htmlFor="selected-props">
        <MultiSelect
          id="selected-props"
          aria-label="Selected Properties"
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
      </EditorField>
    );
  }

  changeFilter(query: TwinMakerQuery, filter: TwinMakerPropertyFilter[], isTabularCondition?: boolean) {
    return isTabularCondition
      ? {
          ...query,
          tabularConditions: {
            propertyFilter: filter,
            orderBy: query.tabularConditions?.orderBy ?? [],
          },
        }
      : {
          ...query,
          filter,
        };
  }

  onFilterChanged = (index: number, evt?: TwinMakerPropertyFilter, isTabularCondition?: boolean) => {
    const { onChange, query } = this.props;
    const filters = isTabularCondition ? query.tabularConditions?.propertyFilter : query.filter;
    const filterList = filters ? filters.slice() : [];

    if (!evt) {
      if (filters) {
        filterList.splice(index, 1);
        onChange(this.changeFilter(query, filterList, isTabularCondition));
        this.props.onRunQuery();
      }
      return;
    }

    // don't run the query -- this will fire often!
    filterList[index] = evt;
    onChange(this.changeFilter(query, filterList, isTabularCondition));
  };

  onAddFilter = (isTabularCondition?: boolean) => () => {
    const { onChange, query } = this.props;
    let filters = isTabularCondition ? query.tabularConditions?.propertyFilter : query.filter;
    filters = filters ? filters.slice() : [];
    filters.push({ name: '', op: DEFAULT_PROPERTY_FILTER_OPERATOR, value: {} });
    onChange(this.changeFilter(query, filters, isTabularCondition));
  };

  renderPropsFilterSelector(
    query: TwinMakerQuery,
    propOpts?: Array<SelectableValue<string>>,
    isTabularCondition?: boolean
  ) {
    let filters = isTabularCondition ? query.tabularConditions?.propertyFilter : query.filter;
    filters = filters ?? [];

    if (!filters.length) {
      filters = [{ name: '', op: DEFAULT_PROPERTY_FILTER_OPERATOR, value: {} }];
    }

    const properties = this.getPropertiesMultiSelectionInfo(query, propOpts);

    return (
      <FilterQueryEditor
        filters={filters}
        properties={properties.options}
        onAdd={this.onAddFilter(isTabularCondition)}
        onChange={this.onFilterChanged}
        isTabularCondition={isTabularCondition}
      />
    );
  }

  onOrderByChanged = (index: number, evt?: TwinMakerOrderBy) => {
    const { onChange, query, onRunQuery } = this.props;
    const orderBy = query.tabularConditions?.orderBy ? query.tabularConditions?.orderBy.slice() : [];
    if (!evt) {
      if (query.tabularConditions?.orderBy) {
        orderBy.splice(index, 1);
        onChange({
          ...query,
          tabularConditions: {
            propertyFilter: query.tabularConditions?.propertyFilter ?? [],
            orderBy,
          },
        });
        this.props.onRunQuery();
      }
      return;
    }

    orderBy[index] = evt;
    onChange({
      ...query,
      tabularConditions: {
        propertyFilter: query.tabularConditions?.propertyFilter ?? [],
        orderBy,
      },
    });
    onRunQuery();
  };

  onAddOrderBy = () => {
    const { onChange, query } = this.props;
    const orderBy = query.tabularConditions?.orderBy ? query.tabularConditions?.orderBy.slice() : [];
    orderBy.push({ propertyName: '' });
    onChange({
      ...query,
      tabularConditions: {
        propertyFilter: query.tabularConditions?.propertyFilter ?? [],
        orderBy,
      },
    });
  };

  renderOrderBySelector(query: TwinMakerQuery, propOpts?: Array<SelectableValue<string>>) {
    let orderBy = query.tabularConditions?.orderBy ?? [];
    if (!orderBy.length) {
      orderBy = [{ propertyName: '' }];
    }

    const properties = this.getPropertiesMultiSelectionInfo(query, propOpts);

    return (
      <OrderByEditor
        orderBy={orderBy}
        properties={properties.options}
        onAdd={this.onAddOrderBy}
        onChange={this.onOrderByChanged}
      />
    );
  }

  onPropertyGroupChange = (event: SelectableValue<string>) => {
    this.onPropertyGroupTextChange(event?.value);
  };

  onPropertyGroupTextChange = (propertyGroupName?: string) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({
      ...query,
      propertyGroupName,
    });
    onRunQuery();
  };

  renderPropGroupSelector(propertyGroupName: string | undefined, propGroups?: SelectablePropGroupsInfo[]) {
    return (
      <EditorField label="Property Group" className={editorFieldStyles} width={20} htmlFor="propertyGroupName">
        <Select
          id="propertyGroupName"
          aria-label="Property Group"
          menuShouldPortal={true}
          value={propertyGroupName}
          options={propGroups}
          onChange={this.onPropertyGroupChange}
          isClearable={true}
          isLoading={this.state.workspaceLoading}
          allowCustomValue={true}
          onCreateOption={this.onPropertyGroupTextChange}
          formatCreateLabel={(v) => `Property Group: ${v}`}
        />
      </EditorField>
    );
  }

  renderQuery(query: TwinMakerQuery) {
    const compType = getSelectionInfo(query.componentTypeId, this.state.workspace?.components, this.state.templateVars);
    const { entity: entityInfo } = this.state;
    switch (query.queryType) {
      case TwinMakerQueryType.ListWorkspace:
      case TwinMakerQueryType.ListScenes:
        return null; // nothing required
      case TwinMakerQueryType.GetAlarms:
        return (
          <>
            <EditorRow>
              <EditorFieldGroup>
                {this.renderAlarmFilterSelector(query, true)}
                {this.renderAlarmMaxResultsInput(query)}
              </EditorFieldGroup>
            </EditorRow>
            <EditorRow>
              <QueryOptions
                query={query}
                grafanaLiveEnabled={this.props.datasource.grafanaLiveEnabled}
                onOrderChange={this.onOrderChange}
                renderStreamingInputs={() => this.renderStreamingInputs(query)}
              />
            </EditorRow>
          </>
        );

      case TwinMakerQueryType.ListEntities:
        return (
          <EditorRow>
            <EditorFieldGroup>{this.renderComponentTypeSelector(query, compType)}</EditorFieldGroup>
          </EditorRow>
        );

      case TwinMakerQueryType.GetEntity:
        return (
          <EditorRow>
            <EditorFieldGroup>{this.renderEntitySelector(query, false)}</EditorFieldGroup>
          </EditorRow>
        );
      case TwinMakerQueryType.GetPropertyValue:
        if (query.entityId) {
          const compName = getSelectionInfo(query.componentName, entityInfo, this.state.templateVars);
          const propGroups: SelectablePropGroupsInfo[] = resolvePropGroups(compName, entityInfo);
          const isAthenaConnector = propGroups.length > 0;
          let propOpts: Array<SelectableValue<string>> | undefined = [];
          const propGroup = query.propertyGroupName;

          if (isAthenaConnector) {
            if (propGroup) {
              propOpts = propGroups?.find((g) => g.value === propGroup)?.props;
            }
          } else {
            propOpts = resolvePropsFromComponentSel(compName, ComponentFieldName.props, entityInfo);
          }
          return (
            <>
              <EditorRow>
                <EditorFieldGroup>
                  {this.renderEntitySelector(query, true)}
                  {this.renderComponentNameSelector(query, compName, true)}
                </EditorFieldGroup>
                <EditorFieldGroup>
                  {isAthenaConnector && this.renderPropGroupSelector(query.propertyGroupName, propGroups)}
                  {(!isAthenaConnector || propGroup) && this.renderPropsSelector(query, propOpts)}
                </EditorFieldGroup>
              </EditorRow>
              {propGroup && <EditorRow>{this.renderPropsFilterSelector(query, propOpts, isAthenaConnector)}</EditorRow>}
              {propGroup && <EditorRow>{this.renderOrderBySelector(query, propOpts)}</EditorRow>}
            </>
          );
        }
        return this.renderEntitySelector(query, true);
      case TwinMakerQueryType.EntityHistory: {
        const compName = getSelectionInfo(query.componentName, entityInfo, this.state.templateVars);
        const propOpts = resolvePropsFromComponentSel(compName, ComponentFieldName.timeSeries, entityInfo);
        return (
          <>
            <EditorRow>
              <EditorFieldGroup>
                {this.renderEntitySelector(query, true)}
                {this.renderComponentNameSelector(query, compName, true, true)}
                {this.renderPropsSelector(query, propOpts)}
              </EditorFieldGroup>
            </EditorRow>
            <EditorRow>{this.renderPropsFilterSelector(query, propOpts)}</EditorRow>
            <EditorRow>
              <QueryOptions
                query={query}
                grafanaLiveEnabled={this.props.datasource.grafanaLiveEnabled}
                onOrderChange={this.onOrderChange}
                renderStreamingInputs={() => this.renderStreamingInputs(query)}
              />
            </EditorRow>
          </>
        );
      }
      case TwinMakerQueryType.ComponentHistory: {
        const propOpts = compType.current?.timeSeries as SelectableQueryResults;
        return (
          <>
            <EditorRow>
              {this.renderComponentTypeSelector(query, compType, 'timeSeries', true)}
              {this.renderPropsSelector(query, propOpts)}
            </EditorRow>
            <EditorRow>{this.renderPropsFilterSelector(query, propOpts)}</EditorRow>
            <EditorRow>
              <QueryOptions
                query={query}
                grafanaLiveEnabled={this.props.datasource.grafanaLiveEnabled}
                onOrderChange={this.onOrderChange}
                renderStreamingInputs={() => this.renderStreamingInputs(query)}
              />
            </EditorRow>
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

    return (
      <div>
        <EditorRows>
          <EditorRow>
            <EditorFieldGroup>
              <EditorField
                label="Query Type"
                tooltip={queryTooltip}
                className={editorFieldStyles}
                width={30}
                htmlFor="query-type"
              >
                <Select
                  id="query-type"
                  aria-label="Query Type"
                  menuShouldPortal={true}
                  options={twinMakerQueryTypes}
                  value={currentQueryType}
                  onChange={this.onQueryTypeChange}
                  placeholder="Select query type"
                  menuPlacement="bottom"
                />
              </EditorField>
            </EditorFieldGroup>
          </EditorRow>
          {this.renderQuery(query)}
        </EditorRows>
      </div>
    );
  }
}

export const editorFieldStyles = css({
  marginBottom: 0,
});
