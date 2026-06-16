import { PanelProps } from '@grafana/data';
import { PanelOptions, TMQueryEditorAwsConfig } from './types';

export interface QueryEditorPanelState {
  configured: boolean;
}

export interface QueryEditorPropsFromParent extends PanelProps<PanelOptions> {
  workspaceId: string;
  awsConfig: TMQueryEditorAwsConfig;
}
