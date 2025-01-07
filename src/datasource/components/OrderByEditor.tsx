import React from 'react';
import { Button, Select } from '@grafana/ui';
import { TwinMakerOrderBy, TwinMakerResultOrder } from 'common/manager';
import { SelectableValue } from '@grafana/data';
import { twinMakerOrderOptions } from 'datasource/queryInfo';
import { EditorField, EditorFieldGroup } from '@grafana/plugin-ui';
import { css } from '@emotion/css';

export interface OrderByEditorProps {
  orderBy: TwinMakerOrderBy[];
  properties: Array<SelectableValue<string>>;
  onChange: (index: number, orderBy?: TwinMakerOrderBy) => void;
  onAdd: () => void;
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
  );
}

export const btnStyle = css({
  marginTop: 5,
  marginInline: 5,
});
