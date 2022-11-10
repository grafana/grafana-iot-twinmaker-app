import React from 'react';
import { Button, InlineField, InlineFieldRow, Select } from '@grafana/ui';
import { DEFAULT_PROPERTY_FILTER_OPERATOR, TwinMakerPropertyFilter } from 'common/manager';
import { firstLabelWidth } from '.';
import { BlurTextInput } from './BlurTextInput';
import { SelectableValue } from '@grafana/data';

export interface FilterQueryEditorProps {
  filters: TwinMakerPropertyFilter[];
  properties: Array<SelectableValue<string>>;
  onChange: (index: number, filter?: TwinMakerPropertyFilter) => void;
  onAdd: () => void;
}

export default function FilterQueryEditor(props: FilterQueryEditorProps) {
  const { filters, properties, onChange } = props;

  const onNameChange = (v: SelectableValue<string>, index: number) => {
    onChange(index, { ...filters[index], name: v.value! });
  };

  const onValueChange = (v: string, index: number) => {
    onChange(index, { ...filters[index], value: v });
  };

  const onOpChange = (v: string, index: number) => {
    onChange(index, { ...filters[index], op: v ?? DEFAULT_PROPERTY_FILTER_OPERATOR });
  };

  return (
    <InlineFieldRow>
      {filters.map((f, index) => (
        <InlineField
          key={`${index}/${f.name}`}
          label={'Filter'}
          grow={true}
          labelWidth={firstLabelWidth}
          tooltip="currently only '=' op is supported"
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
              value={filters[index].value ?? ''}
              onChange={(v) => {
                if (v) {
                  onValueChange(v, index);
                }
              }}
              placeholder="value"
              width={40}
            />
            {index !== filters.length - 1 && (
              <Button icon="trash-alt" variant="secondary" onClick={() => onChange(index)} />
            )}
            {index === filters.length - 1 && <Button icon="plus-circle" variant="secondary" onClick={props.onAdd} />}
          </>
        </InlineField>
      ))}
    </InlineFieldRow>
  );
}
