import React from 'react';
import { Button, Select } from '@grafana/ui';
import { DEFAULT_PROPERTY_FILTER_OPERATOR, TwinMakerFilterValue, TwinMakerPropertyFilter } from 'common/manager';
import { editorFieldStyles } from '.';
import { BlurTextInput } from './BlurTextInput';
import { SelectableValue } from '@grafana/data';
import { EditorField, EditorFieldGroup } from '@grafana/plugin-ui';
import { css } from '@emotion/css';

export interface FilterQueryEditorProps {
  filters: TwinMakerPropertyFilter[];
  properties: Array<SelectableValue<string>>;
  onChange: (index: number, filter?: TwinMakerPropertyFilter, isTabularCondition?: boolean) => void;
  onAdd: () => void;
  isTabularCondition?: boolean;
}

export default function FilterQueryEditor(props: FilterQueryEditorProps) {
  const { filters, properties, onChange, isTabularCondition } = props;

  const onNameChange = (v: SelectableValue<string>, index: number) => {
    onChange(index, { ...filters[index], name: v.value! }, isTabularCondition);
  };

  const onValueChange = (v: string, index: number) => {
    onChange(index, { ...filters[index], value: stringToFilterValue(v, index) }, isTabularCondition);
  };

  const onOpChange = (v: string, index: number) => {
    onChange(index, { ...filters[index], op: v ?? DEFAULT_PROPERTY_FILTER_OPERATOR }, isTabularCondition);
  };

  const stringToFilterValue = (v: string, index: number): TwinMakerFilterValue => {
    const filterVal: TwinMakerFilterValue = {};
    const propSel: SelectableValue<string> | undefined = properties.find((v) => v.value === filters[index].name);
    if (propSel?.description?.includes('(BOOLEAN)')) {
      filterVal.booleanValue = v === 'true';
    } else if (propSel?.description?.includes('(INTEGER)')) {
      filterVal.integerValue = parseInt(v, 10);
    } else if (propSel?.description?.includes('(DOUBLE)')) {
      filterVal.doubleValue = parseFloat(v);
    } else if (propSel?.description?.includes('(LONG)')) {
      filterVal.longValue = parseFloat(v);
    } else if (propSel?.description?.includes('(STRING)')) {
      filterVal.stringValue = v;
    }
    return filterVal;
  };

  const filterValueToString = (v: TwinMakerFilterValue): string => {
    if (v.booleanValue !== undefined) {
      return v.booleanValue.toString();
    } else if (v.doubleValue) {
      return v.doubleValue.toString();
    } else if (v.integerValue) {
      return v.integerValue.toString();
    } else if (v.longValue) {
      return v.longValue.toString();
    } else if (v.stringValue) {
      return v.stringValue;
    }
    return '';
  };

  return (
    <EditorFieldGroup>
      {filters.map((f, index) => (
        <EditorField
          key={`${index}/${f.name}`}
          label="Filter"
          tooltip="Enter expressions to filter property values"
          className={editorFieldStyles}
          htmlFor="filters"
        >
          <div className={css({ display: 'flex' })}>
            <Select
              id="filters"
              aria-label="filters"
              menuShouldPortal={true}
              options={properties}
              value={properties.find((v) => v.value === f.name)}
              onChange={(v) => onNameChange(v, index)}
              placeholder="Select property"
              isClearable={false}
              width={20}
            />
            <BlurTextInput
              width={5}
              value={f.op ?? DEFAULT_PROPERTY_FILTER_OPERATOR}
              onChange={(v) => {
                if (v) {
                  onOpChange(v, index);
                }
              }}
              placeholder={DEFAULT_PROPERTY_FILTER_OPERATOR}
            />
            <BlurTextInput
              value={filterValueToString(filters[index].value)}
              onChange={(v) => {
                if (v) {
                  onValueChange(v, index);
                }
              }}
              placeholder="value"
              width={10}
            />
            <Button
              data-testid="query-builder-filters-remove-button"
              icon="trash-alt"
              variant="destructive"
              size="sm"
              className={btnStyle}
              disabled={filters.length === 1 && isFilterEmpty(filters[0])}
              onClick={() => onChange(index, undefined, isTabularCondition)} // Do not send event
            />
            {index === filters.length - 1 && (
              <Button
                data-testid="query-builder-filters-add-button"
                icon="plus-circle"
                variant="secondary"
                size="sm"
                className={btnStyle}
                onClick={props.onAdd}
              >
                Add
              </Button>
            )}
          </div>
        </EditorField>
      ))}
    </EditorFieldGroup>
  );
}
function isFilterEmpty(filter: TwinMakerPropertyFilter) {
  return !filter.name && !Object.keys(filter.value).length;
}
export const btnStyle = css({
  marginTop: 5,
  marginInline: 5,
});
