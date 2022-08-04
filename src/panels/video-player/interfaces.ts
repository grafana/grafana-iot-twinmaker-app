import { TwinMakerUxSDK } from 'aws-iot-twinmaker-grafana-utils';
import { PanelProps } from '@grafana/data';
import { PanelOptions } from './types';

export interface VideoPlayerPanelState {
  configured: boolean;
}

export interface VideoPlayerPropsFromParent extends PanelProps<PanelOptions> {
  twinMakerUxSdk: TwinMakerUxSDK;
  workspaceId: string;
}
