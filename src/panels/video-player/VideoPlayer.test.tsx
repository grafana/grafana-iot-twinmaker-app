import React from 'react';
import { render } from '@testing-library/react';
import {
  mockGrafanaUI,
  mockTwinMakerPanelProps,
  mockTimeRange,
  mockKinesisVideoClient,
  mockKinesisVideoArchivedMediaClient,
  mockSiteWiseClient,
  mockTwinMakerClient,
} from '../tests/utils/__mocks__';

mockGrafanaUI();
jest.doMock('react-router-dom', () => ({
  useLocation: () => {
    return { search: '' };
  },
}));

const mockLocationSearchToObject = jest.fn().mockImplementation(() => {
  return {};
});
jest.doMock('@grafana/runtime', () => ({
  ...(jest.requireActual('@grafana/runtime') as any),
  locationSearchToObject: mockLocationSearchToObject,
}));

import { ComponentName, VideoData, VideoPlaybackMode } from 'aws-iot-twinmaker-grafana-utils';
import { VideoPlayer } from './VideoPlayer';
import { VideoPlayerPropsFromParent } from './interfaces';
import { mockDisplayOptions } from './tests/common';
import { setTemplateSrv } from '@grafana/runtime';

setTemplateSrv({
  getVariables: () => [],
  replace: (v: string) => v,
});

describe('VideoPlayer', () => {
  it('should load VideoPlayer component when providing kvsStreamName', () => {
    const mockKvsStream = 'mockKvsStream';
    const mockEntityId = 'mockEntityId';
    const mockComponentName = 'mockComponentName';
    const mockWorkspaceId = 'MockWorkspaceId';
    const mockVideoData = new VideoData({
      workspaceId: mockWorkspaceId,
      entityId: mockEntityId,
      componentName: mockComponentName,
      kvsStreamName: mockKvsStream,
      kinesisVideoArchivedMediaClient: mockKinesisVideoArchivedMediaClient,
      kinesisVideoClient: mockKinesisVideoClient,
      siteWiseClient: mockSiteWiseClient,
      twinMakerClient: mockTwinMakerClient,
    });
    const expectedComponentOptions = {
      videoData: mockVideoData,
      playbackMode: VideoPlaybackMode.ON_DEMAND,
      startTime: mockTimeRange.from.toDate(),
      endTime: mockTimeRange.to.toDate(),
    };

    const options = {
      kvsStreamName: mockKvsStream,
      entityId: mockEntityId,
      componentName: mockComponentName,
    };

    const panelProps = mockTwinMakerPanelProps(mockDisplayOptions);
    const props: VideoPlayerPropsFromParent = {
      ...panelProps,
      options,
    };

    render(<VideoPlayer {...props} />);
    expect(panelProps.twinMakerUxSdk.createComponentForReact).toHaveBeenCalledWith(
      ComponentName.VideoPlayer,
      expectedComponentOptions
    );
  });
});
