import React, { useMemo } from 'react';
import { SelectableValue } from '@grafana/data';
import { InlineField, InlineFieldRow, Select } from '@grafana/ui';
import { TwinMakerQueryType, TwinMakerQuery } from 'common/manager';
import { TwinMakerDataSource } from 'datasource/datasource';
import { QueryTypeInfo } from 'datasource/queryInfo';
import { useAsync } from 'react-use';
import { getSelectionInfo } from 'common/info/info';
import { getVariableOptions } from 'common/variables';

export interface Props {
  datasource: TwinMakerDataSource;
  onChange: (query: TwinMakerQuery, definition: string) => void;
  query: TwinMakerQuery;
}

export const variableQueryTypes: QueryTypeInfo[] = [
  {
    label: 'List entities',
    value: TwinMakerQueryType.ListEntities,
    description: `List all entities`,
    defaultQuery: {},
  },
  {
    label: 'List component types',
    value: TwinMakerQueryType.ListComponentTypes,
    description: `List all entities`,
    defaultQuery: {},
  },
  {
    label: 'List component names',
    value: TwinMakerQueryType.ListComponentNames,
    description: `Get component names in an entity`,
    defaultQuery: {},
  },
];

export default function VariableQueryEditor(props: Props) {
  const { datasource, onChange, query } = props;

  const info = useAsync(async () => await datasource.info.getWorkspaceInfo(), [datasource]);
  const entity = useMemo(
    () => getSelectionInfo(query.entityId, info.value?.entities, getVariableOptions({ keepVarSyntax: true })),
    [query, info]
  ); //, this.state.templateVars));

  const onQueryTypeChange = (event: SelectableValue<TwinMakerQueryType>) => {
    onChange({ ...query, queryType: event.value }, '');
  };

  const onEntityIdTextChange = (entityId?: string) => {
    onChange({ ...query, entityId }, '');
  };

  const onEntityIdChange = (event: SelectableValue<string>) => {
    onEntityIdTextChange(event?.value);
  };

  return (
    <>
      <InlineFieldRow>
        <InlineField htmlFor="query-type" label="Query Type" labelWidth={20} grow={true}>
          <Select
            inputId="query-type"
            menuShouldPortal={true}
            options={variableQueryTypes}
            value={variableQueryTypes.find((v) => v.value === query.queryType) ?? variableQueryTypes[0]}
            onChange={onQueryTypeChange}
            placeholder="Select query type"
          />
        </InlineField>
      </InlineFieldRow>
      {query.queryType === TwinMakerQueryType.ListComponentNames && (
        <InlineFieldRow>
          <InlineField label={'Entity'} grow={true} labelWidth={20}>
            <Select
              menuShouldPortal={true}
              value={entity.current}
              options={entity.options}
              onChange={onEntityIdChange}
              isClearable={false}
              allowCustomValue={true}
              onCreateOption={onEntityIdTextChange}
              formatCreateLabel={(v) => `EntityID: ${v}`}
              isLoading={info.loading}
            />
          </InlineField>
        </InlineFieldRow>
      )}
    </>
  );
}
