import { TwinMakerUxSDK } from 'aws-iot-twinmaker-grafana-utils';
import {
  DateTime,
  dateTime,
  EventBus,
  FieldConfigSource,
  LoadingState,
  PanelData,
  PanelProps,
  TimeRange,
} from '@grafana/data';

import { mockWorkspaceId } from './MockTwinMakerState';

const eventBus: EventBus = {
  publish: jest.fn(),
  subscribe: jest.fn(),
  getStream: jest.fn(),
  removeAllListeners: jest.fn(),
  newScopedBus: jest.fn(),
};

const date: Date = new Date('2020-01-01');
const from: DateTime = dateTime(date.getTime() - 1000);
const to: DateTime = dateTime(date.getTime());
export const mockTimeRange: TimeRange = {
  from: from,
  to: to,
  raw: {
    from: from,
    to: to,
  },
};

const mockDataProps: PanelData = {
  state: LoadingState.NotStarted,
  series: [],
  timeRange: mockTimeRange,
};

const mockFieldConfigSource: FieldConfigSource = {
  defaults: {},
  overrides: [],
};

const mockTwinMakerUxSdk = {
  createComponentForReact: jest.fn(),
} as unknown as TwinMakerUxSDK;

export const mockPanelProps = (mockDisplayOptions: any): PanelProps => {
  return {
    id: 0,
    data: mockDataProps,
    timeRange: mockTimeRange,
    timeZone: 'UTC',
    options: mockDisplayOptions,
    transparent: false,
    width: 400,
    height: 400,
    fieldConfig: mockFieldConfigSource,
    renderCounter: 0,
    title: 'Mock Panel',
    eventBus: eventBus,
    onOptionsChange: jest.fn(),
    onFieldConfigChange: jest.fn(),
    replaceVariables: jest.fn(),
    onChangeTimeRange: jest.fn(),
  };
};

export const mockTwinMakerPanelProps = (mockDisplayOptions: any) => {
  return {
    ...mockPanelProps(mockDisplayOptions),
    twinMakerUxSdk: mockTwinMakerUxSdk,
    workspaceId: mockWorkspaceId,
  };
};
