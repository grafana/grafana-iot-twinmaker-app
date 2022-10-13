import { PanelProps } from '@grafana/data';
import { initialize } from '@iot-app-kit/source-iottwinmaker';
import { PanelOptions } from './types';

export interface SceneViewerPropsFromParent extends PanelProps<PanelOptions> {
  appKitTMDataSource: ReturnType<typeof initialize>;
  workspaceId: string;
}

export interface ScenePanelState {
  configured: boolean;
}
