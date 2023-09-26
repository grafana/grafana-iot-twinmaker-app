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
import { IoTSiteWise } from '@aws-sdk/client-iotsitewise';
import { IoTTwinMaker } from '@aws-sdk/client-iottwinmaker';
import { KinesisVideo } from '@aws-sdk/client-kinesis-video';
import { KinesisVideoArchivedMedia } from '@aws-sdk/client-kinesis-video-archived-media';
import { Credentials } from '@aws-sdk/types';

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

const mockAWSCredentials: Credentials = {
  accessKeyId: 'accessKeyId',
  secretAccessKey: 'secretAccessKey',
  sessionToken: 'sessionToken',
};

export const mockSiteWiseClient = new IoTSiteWise({
  ...{
    region: 'abc',
  },
  credentials: mockAWSCredentials,
});
export const mockTwinMakerClient = new IoTTwinMaker({
  ...{
    region: 'abc',
  },
  credentials: mockAWSCredentials,
});
export const mockKinesisVideoClient = new KinesisVideo({
  ...{
    region: 'abc',
  },
  credentials: mockAWSCredentials,
});
export const mockKinesisVideoArchivedMediaClient = new KinesisVideoArchivedMedia({
  ...{
    region: 'abc',
  },
  credentials: mockAWSCredentials,
});

const mockTwinMakerUxSdk = {
  createComponentForReact: jest.fn(),
  awsClients: {
    kinesisVideoArchivedMediaV3: () => mockKinesisVideoArchivedMediaClient,
    kinesisVideoV3: () => mockKinesisVideoClient,
    siteWiseV3: () => mockSiteWiseClient,
    iotTwinMakerV3: () => mockTwinMakerClient,
  },
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

const mockAppKitTMDataSource = {
  videoData: jest.fn(),
  s3SceneLoader: jest.fn(),
  sceneMetadataModule: jest.fn(),
  kGDatamodule: jest.fn(),
  valueDataBindingProviders: jest.fn(),
  query: { timeSeriesData: jest.fn(), propertyValue: jest.fn() },
};

export const mockTwinMakerPanelProps = (mockDisplayOptions: any) => {
  return {
    ...mockPanelProps(mockDisplayOptions),
    twinMakerUxSdk: mockTwinMakerUxSdk,
    appKitTMDataSource: mockAppKitTMDataSource,
    workspaceId: mockWorkspaceId,
  };
};
