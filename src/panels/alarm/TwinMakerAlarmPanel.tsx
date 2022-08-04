import React, { useMemo } from 'react';
import { formattedValueToString, getValueFormat, GrafanaTheme2, PanelProps } from '@grafana/data';
import { AlarmPanelOptions } from './types';
import { processAlarmResult, AlarmState } from './alarms';
import { stylesFactory, useTheme2 } from '@grafana/ui';
import { css } from '@emotion/css';

type Props = PanelProps<AlarmPanelOptions>;

export const TwinMakerAlarmPanel: React.FunctionComponent<Props> = ({ data }) => {
  const results = useMemo(() => processAlarmResult(data.series), [data]);
  const theme = useTheme2();
  const styles = getStyles(theme);

  if (results.invalidFormat || results.warning) {
    return (
      <div className="panel-empty">
        <p>
          Invalid alarm data
          <br />
          {results.warning ?? ''}
        </p>
      </div>
    );
  }

  const dateFmt = getValueFormat('dateTimeAsSystem');

  const getRowStyle = (a: AlarmState) => {
    switch (a.alarmStatus) {
      case 'ACTIVE':
      case 'ERROR':
        return styles.ERROR;
      case 'WARN':
        return styles.WARNING;
    }
    return styles.OK;
  };

  return (
    <>
      {/* {Object.entries(results.status).map((v) => (
        <div key={v[0]}>
          {v[0]} :: {v[1]}
        </div>
      ))} */}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>When</th>
            <th>Alarm</th>
            <th>Entity</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {results.alarms.map((a, i) => (
            <tr className={getRowStyle(a)} key={`${a.alarmId}/${i}`} onClick={() => alert('clicked: ' + a.alarmId)}>
              <td>{a.Time ? formattedValueToString(dateFmt(a.Time)) : ''}</td>
              <td>{a.name}</td>
              <td>{a.entityName}</td>
              <td>{a.alarmStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

const getStyles = stylesFactory((theme: GrafanaTheme2) => {
  return {
    table: css`
      width: 100%;
      border-collapse: separate;

      th {
        width: auto;
        padding: ${theme.v1.spacing.insetSquishMd};
        text-align: left;
        line-height: 30px;
        height: 30px;
        white-space: nowrap;
      }

      td {
        padding: ${theme.v1.spacing.insetSquishMd};
        line-height: 30px;
        height: 30px;
        white-space: nowrap;
      }

      thead tr {
        background: ${theme.colors.background.secondary};
      }

      tbody td {
        cursor: pointer;
      }
    `,
    ERROR: css`
      background: ${theme.colors.error.main};
      color: ${theme.colors.error.contrastText};
      &:hover td {
        background: ${theme.colors.error.shade};
      }
    `,
    WARNING: css`
      background: ${theme.colors.warning.main};
      color: ${theme.colors.warning.contrastText};
      &:hover td {
        background: ${theme.colors.warning.shade};
      }
    `,
    OK: css`
      &:hover td {
        background: ${theme.colors.background.secondary};
      }
    `,
  };
});
