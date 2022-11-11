import React from 'react';
import { Button, InlineField, InlineFieldRow, Select } from '@grafana/ui';
import { DEFAULT_PROPERTY_FILTER_OPERATOR, TwinMakerFilterValue, TwinMakerPropertyFilter } from 'common/manager';
import { firstLabelWidth } from '.';
import { BlurTextInput } from './BlurTextInput';
import { SelectableValue } from '@grafana/data';

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
    if (propSel?.label?.includes('(BOOLEAN)')) {
      filterVal.booleanValue = v === 'true';
    } else if (propSel?.label?.includes('(INTEGER)')) {
      filterVal.integerValue = parseInt(v, 10);
    } else if (propSel?.label?.includes('(DOUBLE)')) {
      filterVal.doubleValue = parseFloat(v);
    } else if (propSel?.label?.includes('(LONG)')) {
      filterVal.longValue = parseFloat(v);
    } else if (propSel?.label?.includes('(STRING)')) {
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
    <InlineFieldRow>
      {filters.map((f, index) => (
        <InlineField
          key={`${index}/${f.name}`}
          label={'Filter'}
          grow={true}
          labelWidth={firstLabelWidth}
          tooltip="enter expressions to filter property values"
        >
          <>
            <Select
              menuShouldPortal={true}
              options={properties}
              value={properties.find((v) => v.value === f.name)}
              onChange={(v) => onNameChange(v, index)}
              placeholder="Select a property"
              isClearable={false}
              width={40}
            />
            <BlurTextInput
              width={14}
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
              width={40}
            />
            <Button
              icon="trash-alt"
              variant="secondary"
              onClick={() => onChange(index, undefined, isTabularCondition)} // Do not send event
            />
            {index === filters.length - 1 && <Button icon="plus-circle" variant="secondary" onClick={props.onAdd} />}
          </>
        </InlineField>
      ))}
    </InlineFieldRow>
  );
}
