import { EditorField } from '@grafana/plugin-ui';
import { CollapsableSection, Select } from '@grafana/ui';
import { twinMakerOrderOptions } from 'datasource/queryInfo';
import React from 'react';
import { editorFieldStyles } from './QueryEditor';
import { TwinMakerQueryType, TwinMakerQuery, TwinMakerResultOrder } from 'common/manager';
import { css } from '@emotion/css';
import { SelectableValue } from '@grafana/data';

interface Props {
  query: TwinMakerQuery;
  grafanaLiveEnabled: boolean;
  onOrderChange: (value: SelectableValue<TwinMakerResultOrder>) => void;
  renderStreamingInputs: () => React.JSX.Element | null;
}
export function QueryOptions({ query, onOrderChange, grafanaLiveEnabled, renderStreamingInputs }: Props) {
  const sortable =
    query.queryType === TwinMakerQueryType.ComponentHistory || query.queryType === TwinMakerQueryType.EntityHistory;
  if (!grafanaLiveEnabled && !sortable) {
    return null;
  }
  return (
    <div className={collapseStyles.collapseRow}>
      <CollapsableSection
        className={collapseStyles.collapse}
        label={
          <p className={collapseStyles.collapseTitle} data-testid="collapse-title">
            Options
          </p>
        }
        isOpen={false}
      >
        <div style={{ display: 'flex' }}>
          {sortable && (
            <EditorField htmlFor="order" label="Order" className={editorFieldStyles} width={15} id="order-field">
              <Select
                id="order"
                aria-label="Order"
                menuShouldPortal={true}
                options={twinMakerOrderOptions}
                value={twinMakerOrderOptions.find((v) => v.value === query.order)}
                onChange={onOrderChange}
                placeholder="default"
                isClearable
              />
            </EditorField>
          )}
          {renderStreamingInputs()}
        </div>
      </CollapsableSection>
    </div>
  );
}

const collapseStyles = {
  collapse: css({
    alignItems: 'flex-start',
  }),
  collapseTitle: css({
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 0,
  }),
  collapseRow: css({
    display: 'flex',
    flexDirection: 'column',
    '>div': {
      alignItems: 'baseline',
      justifyContent: 'flex-end',
    },
    '*[id^="collapse-content-"]': {
      padding: 'unset',
    },
    '#order-field': css({
      marginRight: 16,
    }),
  }),
};
