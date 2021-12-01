import React from 'react';
import { Button, InlineField, InlineFieldRow, Select } from '@grafana/ui';
import { VariableAction } from '../types';
import { FIRST_LABEL_WIDTH } from './LayoutRuleEditor';
import { getVariableOptions } from 'common/variables';
import { getSelectionInfo } from 'common/info/info';
import { SelectableValue } from '@grafana/data';

export interface Props {
  index: number;
  action: VariableAction;
  last: boolean;
  onChange: (index: number, action?: VariableAction) => void;
  onAdd: () => void;
}

export default function VariableActionEditor(props: Props) {
  const { index, action, last, onChange } = props;

  const onNameChange = (v?: SelectableValue<string>) => {
    onChange(index, { ...action, variable: v?.value ?? '' });
  };

  const onValueChange = (v?: SelectableValue<string>) => {
    onChange(index, { ...action, value: v?.value ?? '' });
  };

  const info = getVariableOptions({ hideValue: true });
  const variable = getSelectionInfo(action.variable, info);
  const value = getSelectionInfo(action.value, info);

  return (
    <InlineFieldRow>
      <InlineField label={'Set'} grow={true} labelWidth={FIRST_LABEL_WIDTH}>
        <Select
          menuShouldPortal={true}
          value={variable.current}
          options={variable.options}
          onChange={onNameChange}
          isClearable={true}
          allowCustomValue={true}
          formatCreateLabel={(v) => `Variable: ${v}`}
          placeholder="Variable"
        />
      </InlineField>
      <InlineField label={'='} grow={true} labelWidth={3}>
        <Select
          menuShouldPortal={true}
          value={value.current}
          options={value.options}
          onChange={onValueChange}
          isClearable={true}
          allowCustomValue={true}
          formatCreateLabel={(v) => `Value: ${v}`}
          placeholder="Value"
        />
      </InlineField>
      <>
        {!last && <Button icon="trash-alt" variant="secondary" onClick={() => onChange(index)} />}
        {last && <Button icon="plus-circle" variant="secondary" onClick={props.onAdd} />}
      </>
    </InlineFieldRow>
  );
}
