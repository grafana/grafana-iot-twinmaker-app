import React from 'react';
import { Button, InlineField, InlineFieldRow } from '@grafana/ui';
import { DEFAULT_PROPERTY_FILTER_OPERATOR, TwinMakerPropertyFilter } from 'common/manager';
import { firstLabelWidth } from '.';
import { BlurTextInput } from './BlurTextInput';

export interface Props {
  index: number;
  filter: TwinMakerPropertyFilter;
  last: boolean;
  onChange: (index: number, filter?: TwinMakerPropertyFilter) => void;
  onAdd: () => void;
}

export default function FilterQueryEditor(props: Props) {
  const { index, filter, last, onChange } = props;

  const onNameChange = (v?: string) => {
    onChange(index, { ...filter, name: v! });
  };

  const onValueChange = (v?: string) => {
    onChange(index, { ...filter, value: v! });
  };

  const onOpChange = (v?: string) => {
    onChange(index, { ...filter, op: v ?? DEFAULT_PROPERTY_FILTER_OPERATOR });
  };

  return (
    <InlineFieldRow>
      <InlineField
        label={index === 0 ? 'Filter' : ' (and)'}
        grow={true}
        labelWidth={firstLabelWidth}
        tooltip="currently only string fields are supported"
      >
        <>
          <BlurTextInput value={filter.name ?? ''} onChange={onNameChange} placeholder="name" />
          <BlurTextInput
            width={14}
            value={filter.op ?? DEFAULT_PROPERTY_FILTER_OPERATOR}
            onChange={onOpChange}
            placeholder={DEFAULT_PROPERTY_FILTER_OPERATOR}
          />
          <BlurTextInput value={filter.value ?? ''} onChange={onValueChange} placeholder="value" />
          {!last && <Button icon="trash-alt" variant="secondary" onClick={() => onChange(index)} />}
          {last && <Button icon="plus-circle" variant="secondary" onClick={props.onAdd} />}
        </>
      </InlineField>
    </InlineFieldRow>
  );
}
