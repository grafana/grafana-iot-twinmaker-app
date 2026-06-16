import { TwinMakerUxSDK } from 'aws-iot-twinmaker-grafana-utils';
import { PanelProps } from '@grafana/data';
import { PanelOptions } from './types';

export interface AlarmConfigurationPanelState {
  configured: boolean;
  editModalOpen: boolean;
  alarmName: string;
  entityId: string;
  alarmThreshold?: number;
  alarmNotificationRecipient: string;
  warnings?: string;
}

export interface AlarmConfigurationPropsFromParent extends PanelProps<PanelOptions> {
  twinMakerUxSdk: TwinMakerUxSDK;
}
