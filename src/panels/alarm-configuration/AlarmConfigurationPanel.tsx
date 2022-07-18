import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';

import { throwError } from 'rxjs';
import { DataQueryRequest, PanelProps } from '@grafana/data';
import { Button, Label, LoadingPlaceholder } from '@grafana/ui';

import { configureSdkWithDataSource, DataSourceParams } from '../sdkInit';
import { PanelOptions } from './types';
import { getTwinMakerDashboardManager, TwinMakerQuery } from 'common/manager';
import { processAlarmQueryInput, processAlarmResult } from './alarmParser';

import IoTTwinMaker, { BatchPutPropertyValuesRequest } from 'aws-sdk/clients/iottwinmaker';

import { AlarmEditModal } from './AlarmEditModal';

import { getTemplateSrv } from '@grafana/runtime';

type Props = PanelProps<PanelOptions>;

export const AlarmConfigurationPanel: React.FunctionComponent<Props> = ({ id, data, options }) => {
  
  const [configured, setConfigured] = useState(false);

  //do once stuff
  useLayoutEffect(() => {
    getTwinMakerDashboardManager().registerTwinMakerPanel(id, {
      twinMakerPanelQueryRunner: () => throwError(() => `not implemented yet (see twinmaker debug panel)`),
      onDashboardAction: (cmd) => {
        console.log('TODO! implement action sent from the manager???', cmd);
      },
    });
  }, [id]);

  //unmount effect
  useEffect(() => {
    return () => {
      getTwinMakerDashboardManager().destroyTwinMakerPanel(id);

    }
  }, []);

  const [twinMakerClient, setTwinMakerClient] = useState<IoTTwinMaker | undefined>();
  const [dataSourceParams, setDataSourceParams] = useState<DataSourceParams | undefined>(undefined);

  useEffect(() => {
    const uid = options.datasource;
    const runConfigure = async () => {
      const params = await configureSdkWithDataSource(uid);
      setDataSourceParams(params);
      setTwinMakerClient(params?.twinMakerUxSdk.awsClients.iotTwinMaker());
      setConfigured(true);
    };
    runConfigure();
  }, [options.datasource, setDataSourceParams, setTwinMakerClient]);

  const [alarmName, setAlarmName] = useState('');
  const [entityId, setEntityId] = useState('');
  const [alarmThreshold, setAlarmThreshold] = useState<number | undefined>();
  const [alarmNotificationRecipient, setAlarmNotificationRecipient] = useState('');
  const [warnings, setWarnings] = useState('');

  const results = useMemo(() => processAlarmResult(data.series), [data.series]);
  const queryInfo = useMemo(
    () => processAlarmQueryInput(data.request as DataQueryRequest<TwinMakerQuery>),
    [data.request]
  );

  useEffect(() => {
    if (results.invalidFormat || queryInfo.invalidFormat) {
      setWarnings(results.warning + ' ' + queryInfo.warning);
    } else {
      setWarnings('');
    }

    const templateSrv = getTemplateSrv();
    setAlarmName(queryInfo.alarmName ? templateSrv.replace(queryInfo.alarmName) : '');
    setEntityId(queryInfo.entityId ? templateSrv.replace(queryInfo.entityId) : '');
    setAlarmThreshold(results.alarmThreshold);
    setAlarmNotificationRecipient(results.alarmNotificationRecipient ? results.alarmNotificationRecipient : '');
  }, [results, queryInfo]);

  const updateAlarmThreshold = useCallback(
    (newThreshold: number) => {
      const request: BatchPutPropertyValuesRequest = {
        workspaceId: dataSourceParams?.workspaceId!,
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
        console.error('TwinMaker client not defined');
      }
    },
    [dataSourceParams, alarmName, entityId, twinMakerClient, setAlarmThreshold, setWarnings]
  );

  const [editModalOpen, setEditModalOpen] = useState(false);
  const toggleModal = useCallback(() => {
    setEditModalOpen(!editModalOpen);
  }, [setEditModalOpen, editModalOpen]);

  if(!configured) {
    return <LoadingPlaceholder text={'Loading...'} />;
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
        <Label description={alarmName}> Alarm ID </Label>
        <br />
        <Label description={alarmThreshold}> Thresold </Label>
        <br />
        <Label description={alarmNotificationRecipient}> Notifications</Label>
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
