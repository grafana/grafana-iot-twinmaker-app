import React from 'react';
import { Button, InlineField, InlineFieldRow, Select } from '@grafana/ui';
import { TwinMakerOrderBy, TwinMakerResultOrder } from 'common/manager';
import { firstLabelWidth } from '.';
import { SelectableValue } from '@grafana/data';
import { twinMakerOrderOptions } from 'datasource/queryInfo';
import { EditorField, EditorFieldGroup } from '@grafana/experimental';
import { css } from '@emotion/css';

export interface OrderByEditorProps {
  orderBy: TwinMakerOrderBy[];
  properties: Array<SelectableValue<string>>;
  onChange: (index: number, orderBy?: TwinMakerOrderBy) => void;
  onAdd: () => void;
  newFormStylingEnabled?: boolean;
}

export default function OrderByEditor(props: OrderByEditorProps) {
  const { orderBy, properties, onChange } = props;

  const onNameChange = (v: SelectableValue<string>, index: number) => {
    onChange(index, { ...orderBy[index], propertyName: v.value! });
  };

  const onOrderChange = (v: SelectableValue<TwinMakerResultOrder>, index: number) => {
    onChange(index, { ...orderBy[index], order: v.value! });
  };

  return (
    <>
      {props.newFormStylingEnabled ? (
        <EditorFieldGroup>
          {orderBy.map((o, index) => (
            <EditorField
              key={`${index}/${o.propertyName}`}
              label="Order By"
              tooltip="enter the order of property values"
              htmlFor="order-by"
            >
              <div className={css({ display: 'flex' })}>
                <Select
                  id="order-by"
                  aria-label="order by property"
                  menuShouldPortal={true}
                  options={properties}
                  value={properties.find((v) => v.value === o.propertyName)}
                  onChange={(v) => onNameChange(v, index)}
                  placeholder="Select a property"
                  isClearable={false}
                  width={25}
                />
                <Select
                  aria-label="select order"
                  menuShouldPortal={true}
                  options={twinMakerOrderOptions}
                  value={twinMakerOrderOptions.find((v) => v.value === o.order)}
                  onChange={(v) => onOrderChange(v, index)}
                  placeholder="default"
                  isClearable={false}
                  width={25}
                />
                <Button
                  data-testid="query-builder-filters-remove-button"
                  icon="trash-alt"
                  variant="destructive"
                  size="sm"
                  className={btnStyle}
                  onClick={() => onChange(index)}
                />

                {index === orderBy.length - 1 && (
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
      ) : (
        <InlineFieldRow>
          {orderBy.map((o, index) => (
            <InlineField
              key={`${index}/${o.propertyName}`}
              label={'Order By'}
              grow={true}
              labelWidth={firstLabelWidth}
              tooltip="enter the order of property values"
            >
              <>
                <Select
                  menuShouldPortal={true}
                  options={properties}
                  value={properties.find((v) => v.value === o.propertyName)}
                  onChange={(v) => onNameChange(v, index)}
                  placeholder="Select a property"
                  isClearable={false}
                  width={40}
                />
                <Select
                  menuShouldPortal={true}
                  options={twinMakerOrderOptions}
                  value={twinMakerOrderOptions.find((v) => v.value === o.order)}
                  onChange={(v) => onOrderChange(v, index)}
                  placeholder="default"
                  isClearable={false}
                  width={40}
                />
                <Button icon="trash-alt" variant="secondary" onClick={() => onChange(index)} />
                {index === orderBy.length - 1 && (
                  <Button icon="plus-circle" variant="secondary" onClick={props.onAdd} />
                )}
              </>
            </InlineField>
          ))}
        </InlineFieldRow>
      )}
    </>
  );
}

export const btnStyle = css({
  marginTop: 5,
  marginInline: 5,
});
