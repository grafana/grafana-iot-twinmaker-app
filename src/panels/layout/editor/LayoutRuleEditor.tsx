import React from 'react';
import { Button, Field, InlineField, InlineFieldRow, LinkButton, Select } from '@grafana/ui';
import { standardEditorsRegistry } from '@grafana/data';

import { LayoutRule, VariableAction } from '../types';
import { SelectableComponents } from 'common/info/types';
import { getSelectionInfo } from 'common/info/info';
import VariableActionEditor from './VariableActionEditor';

export interface Props {
  index: number;
  value: LayoutRule;
  onChange: (index: number, v?: LayoutRule) => void;
  components?: SelectableComponents;
}

export const FIRST_LABEL_WIDTH = 7;

export function LayoutRuleEditor(props: Props) {
  const onActionChanged = (index: number, evt?: VariableAction) => {
    const { onChange, value } = props;
    const actions = value.actions ? value.actions.slice() : [];
    if (!evt) {
      if (value.actions) {
        actions.splice(index, 1);
        onChange(props.index, { ...value, actions });
      }
      return;
    }

    // don't run the query -- this will fire often!
    actions[index] = evt;
    onChange(props.index, { ...value, actions });
  };

  const onAddAction = () => {
    const { onChange, value } = props;
    const actions = value.actions ? value.actions.slice() : [];
    actions.push({ variable: '' });
    onChange(props.index, { ...value, actions });
  };

  const compType = getSelectionInfo(props.value?.componentTypeId ?? '', props.components);
  const dash = {
    ...standardEditorsRegistry.get('dashboard-uid'),
    settings: {
      placeholder: 'Merge dashboard',
      isClearable: true,
    },
  };

  const actions = props.value.actions ?? [];
  if (!actions.length) {
    actions.push({ variable: '' });
  }

  return (
    <Field label="When">
      <div>
        <InlineFieldRow>
          <InlineField label="Type" labelWidth={FIRST_LABEL_WIDTH} grow>
            <Select
              menuShouldPortal={true}
              value={compType.current}
              options={compType.options}
              onChange={(v) => {
                props.onChange(props.index, {
                  ...props.value,
                  componentTypeId: v?.value!,
                });
              }}
              allowCustomValue={true}
              formatCreateLabel={(v) => `Component Type: ${v}`}
              placeholder="Select component type"
            />
          </InlineField>
          <Button icon="trash-alt" variant="secondary" size="md" onClick={() => props.onChange(props.index)} />
        </InlineFieldRow>
        {actions.map((a, index) => (
          <VariableActionEditor
            key={`${index}/${a.variable}`}
            index={index}
            action={a}
            last={index >= actions.length - 1}
            onAdd={onAddAction}
            onChange={onActionChanged}
          />
        ))}
        <InlineFieldRow>
          <InlineField label="Show" labelWidth={FIRST_LABEL_WIDTH} grow>
            <dash.editor
              value={props.value.dashboard}
              onChange={(v) => {
                props.onChange(props.index, {
                  ...props.value,
                  dashboard: v,
                });
              }}
              context={{} as any}
              item={dash}
            />
          </InlineField>
          <LinkButton icon="external-link-alt" variant="secondary" size="md" href={`/d/${props.value.dashboard}/`} />
        </InlineFieldRow>
      </div>
    </Field>
  );
}
