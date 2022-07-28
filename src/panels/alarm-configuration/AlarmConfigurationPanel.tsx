import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { DataQueryRequest, PanelProps } from '@grafana/data';
import { Button, Label, LoadingPlaceholder } from '@grafana/ui';

import { PanelOptions } from './types';
import { TwinMakerQuery } from 'common/manager';
import { processAlarmQueryInput, processAlarmResult } from './alarmParser';

import { BatchPutPropertyValuesRequest } from 'aws-sdk/clients/iottwinmaker';

import { AlarmEditModal } from './AlarmEditModal';

import { getTemplateSrv } from '@grafana/runtime';

import { usePanelRegisteration } from 'hooks/usePanelRegistration';
import { useTwinMakerClient } from 'hooks/useTwinMakerClient';

type Props = PanelProps<PanelOptions>;

const NO_CLIENT = 'TwinMaker client not defined';
const LOADING = 'Loading...';

export const AlarmConfigurationPanel: React.FunctionComponent<Props> = ({ id, data, options }) => {
    
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [alarmName, setAlarmName] = useState('');
  const [entityId, setEntityId] = useState('');
  const [alarmThreshold, setAlarmThreshold] = useState<number | undefined>();
  const [alarmNotificationRecipient, setAlarmNotificationRecipient] = useState('');
  const [warnings, setWarnings] = useState('');
  const [twinMakerClient, dataSourceParams] = useTwinMakerClient(options.datasource);
  const configured = !!twinMakerClient;

  const results = useMemo(() => processAlarmResult(data.series), [data.series]);
  const queryInfo = useMemo(
    () => processAlarmQueryInput(data.request as DataQueryRequest<TwinMakerQuery>),
    [data.request]
  );
  usePanelRegisteration(id);

  useEffect(() => {
    let warning = '';
    if (results.invalidFormat || queryInfo.invalidFormat) {
      if(!!results.warning) {
        warning = results.warning;
      }
      if(!!queryInfo.warning && !!warning) {
        warning = `${warning} ${queryInfo.warning}`;
      } else if (!!queryInfo.warning){
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
      const request: BatchPutPropertyValuesRequest = {
        workspaceId: dataSourceParams!.workspaceId,
        entries: [
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
        ],
      };
      if (twinMakerClient) {
        twinMakerClient
          .batchPutPropertyValues(request)
          .promise()
          .then(() => {
            setAlarmThreshold(newThreshold);
          })
          .catch((error: any) => {
            setWarnings(error.message);
          });
      } else {
        console.error(NO_CLIENT);
      }
    },
    [dataSourceParams, alarmName, entityId, twinMakerClient, setAlarmThreshold, setWarnings]
  );

  const toggleModal = useCallback(() => {
    setEditModalOpen(!editModalOpen);
  }, [setEditModalOpen, editModalOpen]);

  if(!configured) {
    return <LoadingPlaceholder text={LOADING} />;
  } else if (!dataSourceParams) {
    return <div> No TwinMaker Data Source Connected: ${options.datasource} </div>;
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
          <dt>Thresold</dt>
          <dd>{alarmThreshold}</dd>
          <dt>Notifications</dt>
          <dd>{alarmNotificationRecipient}</dd>
        </dl>
        <div>
          <Button variant="secondary" onClick={toggleModal}>Edit Alarm</Button>
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
