import { PanelProps } from '@grafana/data';
import { initialize } from '@iot-app-kit/source-iottwinmaker';
import { PanelOptions } from './types';

export interface VideoPlayerPanelState {
  configured: boolean;
}

export interface VideoPlayerPropsFromParent extends PanelProps<PanelOptions> {
  appKitTMDataSource: ReturnType<typeof initialize>;
  workspaceId: string;
}
