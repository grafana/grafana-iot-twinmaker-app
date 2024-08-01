import React, { useMemo } from 'react';
import { formattedValueToString, getValueFormat, GrafanaTheme2, PanelProps } from '@grafana/data';
import { AlarmPanelOptions } from './types';
import { processAlarmResult, AlarmState } from './alarms';
import { useStyles2 } from '@grafana/ui';
import { css } from '@emotion/css';

type Props = PanelProps<AlarmPanelOptions>;

export const TwinMakerAlarmPanel: React.FunctionComponent<Props> = ({ data }) => {
  const results = useMemo(() => processAlarmResult(data.series), [data]);
  const styles = useStyles2(getStyles);

  if (results.invalidFormat || results.warning) {
    return (
      <div className={styles.panelEmpty}>
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
        return styles.error;
      case 'WARN':
        return styles.error;
    }
    return styles.ok;
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

const getStyles = (theme: GrafanaTheme2) => ({
    table: css({
      width: '100%',
      borderCollapse: 'separate',
      th: {
        width: 'auto',
        padding: theme.spacing(0.5,1),
        textAlign: 'left',
        lineHeight: 30,
        height: 30,
        whiteSpace: 'nowrap',
      },
      td: {
        padding: theme.spacing(0.5,1),
        lineHeight: 30,
        height: 30,
        whiteSpace: 'nowrap'
      },
      'thead tr': {
        background: theme.colors.background.secondary
      },
      'tbody td': {
        cursor: 'pointer'
      }
    }),
    error: css({
      background: theme.colors.error.main,
      color: theme.colors.error.contrastText,
      '&:hover td': {
        background: theme.colors.error.shade,
      }
    }),
    warning: css({
      background: theme.colors.warning.main,
      color: theme.colors.warning.contrastText,
      '&:hover td': {
        background: theme.colors.warning.shade,
      }
    }),
    ok: css({
      '&:hover td': {
        background: theme.colors.background.secondary,
      }
    }),
    panelEmpty: css({
      display: 'flex',
      alignItems: 'center',
      height: '100%',
      width: '100%',
      p: {
        textAlign: 'center',
        color: theme.colors.text.secondary,
        fontSize: theme.typography.h2.fontSize,
        width: '100%',
      }
    })
});
