import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { DataQueryRequest, PanelProps } from '@grafana/data';
import { getTemplateSrv, locationSearchToObject } from '@grafana/runtime';
import { Button, LoadingPlaceholder } from '@grafana/ui';

import { Entries } from 'aws-sdk/clients/iottwinmaker';

import { getTwinMakerDatasource } from 'common/datasourceSrv';
import { TwinMakerQuery } from 'common/manager';
import { usePanelRegistration } from 'hooks/usePanelRegistration';

import { AlarmEditModal } from './AlarmEditModal';
import { processAlarmQueryInput, processAlarmResult } from './alarmParser';
import { PanelOptions } from './types';
import { TwinMakerDataSource } from 'datasource/datasource';
import { refreshPanelsInDashboard } from 'common/utils';

type Props = PanelProps<PanelOptions>;

const LOADING = 'Loading...';

export const AlarmConfigurationPanel: React.FunctionComponent<Props> = ({ id, data, options }) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [alarmName, setAlarmName] = useState('');
  const [entityId, setEntityId] = useState('');
  const [alarmThreshold, setAlarmThreshold] = useState<number | undefined>();
  const [alarmNotificationRecipient, setAlarmNotificationRecipient] = useState('');
  const [warnings, setWarnings] = useState('');
  const [dataSource, setDataSource] = useState<TwinMakerDataSource>();
  const { search } = useLocation();

  const configured = !!dataSource;

  const toField: string | undefined = useMemo(() => {
    // Get variables from the URL
    const queryParams = locationSearchToObject(search || '');
    return queryParams['to'] ? (queryParams['to'] as string) : undefined;
  }, [search]);

  const results = useMemo(() => processAlarmResult(data.series), [data.series]);
  const queryInfo = useMemo(
    () => processAlarmQueryInput(data.request as DataQueryRequest<TwinMakerQuery>),
    [data.request]
  );
  usePanelRegistration(id);

  useEffect(() => {
    const doAsync = async () => {
      const ds = await getTwinMakerDatasource(options.datasource);
      setDataSource(ds);
    };
    doAsync();
  }, [options.datasource]);

  useEffect(() => {
    let warning = '';
    if (results.invalidFormat || queryInfo.invalidFormat) {
      if (!!results.warning) {
        warning = results.warning;
      }
      if (!!queryInfo.warning && !!warning) {
        warning = `${warning} ${queryInfo.warning}`;
      } else if (!!queryInfo.warning) {
        warning = queryInfo.warning;
      }
      setWarnings(results.warning + ' ' + queryInfo.warning);
    }
    setWarnings(warning);

    const templateSrv = getTemplateSrv();
    setAlarmName(queryInfo.alarmName ? templateSrv.replace(queryInfo.alarmName) : '');
    setEntityId(queryInfo.entityId ? templateSrv.replace(queryInfo.entityId) : '');
    setAlarmThreshold(results.alarmThreshold);
    setAlarmNotificationRecipient(results.alarmNotificationRecipient ? results.alarmNotificationRecipient : '');
  }, [results, queryInfo]);

  const updateAlarmThreshold = useCallback(
    (newThreshold: number) => {
      const entries: Entries = [
        {
          entityPropertyReference: {
            componentName: alarmName,
            entityId: entityId,
            propertyName: 'alarm_threshold',
          },
          propertyValues: [
            {
              timestamp: new Date(),
              value: {
                doubleValue: newThreshold,
              },
            },
          ],
        },
      ];
      if (dataSource) {
        const doAsync = async () => {
          await dataSource.batchPutPropertyValues(entries);
          if (toField && toField === 'now') {
            setAlarmThreshold(newThreshold);
          }
          refreshPanelsInDashboard();
        };
        doAsync();
      }
    },
    [alarmName, dataSource, entityId, toField, setAlarmThreshold]
  );

  const toggleModal = useCallback(() => {
    setEditModalOpen(!editModalOpen);
  }, [setEditModalOpen, editModalOpen]);

  if (!configured) {
    return <LoadingPlaceholder text={LOADING} />;
  } else if (warnings) {
    return (
      <div>
        <div> TwinMaker Data Source Connected </div>
        <div> Warnings: {warnings}</div>
      </div>
    );
  } else {
    return (
      <div>
        <dl>
          <dt>Alarm ID</dt>
          <dd>{alarmName}</dd>
          <dt>Threshold</dt>
          <dd>{alarmThreshold}</dd>
          <dt>Notifications</dt>
          <dd>{alarmNotificationRecipient}</dd>
        </dl>
        <div>
          <Button variant="secondary" onClick={toggleModal}>
            Edit Alarm
          </Button>
        </div>
        <AlarmEditModal
          isOpen={editModalOpen}
          onDismiss={toggleModal}
          onSave={updateAlarmThreshold}
          currentThreshold={alarmThreshold!}
        ></AlarmEditModal>
      </div>
    );
  }
};
