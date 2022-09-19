import { TwinMakerUxSDK } from 'aws-iot-twinmaker-grafana-utils';
import { PanelProps } from '@grafana/data';
import { PanelOptions, TMQueryEditorAwsConfig } from './types';

export interface QueryEditorPanelState {
  configured: boolean;
}

export interface QueryEditorPropsFromParent extends PanelProps<PanelOptions> {
  twinMakerUxSdk: TwinMakerUxSDK;
  workspaceId: string;
  awsConfig: TMQueryEditorAwsConfig;
}
