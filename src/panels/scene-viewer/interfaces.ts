import { TwinMakerUxSDK } from 'aws-iot-twinmaker-grafana-utils';
import { PanelProps } from '@grafana/data';
import { PanelOptions } from './types';

export interface SceneViewerPropsFromParent extends PanelProps<PanelOptions> {
  twinMakerUxSdk: TwinMakerUxSDK;
  workspaceId: string;
}

export interface ScenePanelState {
  configured: boolean;
}
