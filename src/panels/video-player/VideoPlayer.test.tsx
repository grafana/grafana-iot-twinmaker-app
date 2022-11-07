import React from 'react';
import { render } from '@testing-library/react';
import { mockGrafanaUI, mockTwinMakerPanelProps, mockTimeRange } from '../tests/utils/__mocks__';

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

const videoPlayerMock = jest.fn();
const requestUploadMock = jest.fn();
jest.doMock('@iot-app-kit/react-components', () => ({
  VideoPlayer: videoPlayerMock,
  RequestVideoUpload: requestUploadMock,
}));

import { VideoPlayer } from './VideoPlayer';
import { VideoPlayerPropsFromParent } from './interfaces';
import { mockDisplayOptions } from './tests/common';
import { setTemplateSrv } from '@grafana/runtime';
import { Viewport } from '@iot-app-kit/core';

setTemplateSrv({
  getVariables: () => [],
  replace: (v: string) => v,
});

describe('VideoPlayer', () => {
  it('should load VideoPlayer component when providing kvsStreamName', () => {
    let videoPlayProp: any;
    videoPlayerMock.mockImplementation((p) => {
      videoPlayProp = p;
      return (<div>VideoPlayer</div>) as any;
    });
    let requestUploadProp: any;
    requestUploadMock.mockImplementation((p) => {
      requestUploadProp = p;
      return (<div>RequestVideoUpload</div>) as any;
    });

    const mockKvsStream = 'mockKvsStream';
    const mockEntityId = 'mockEntityId';
    const mockComponentName = 'mockComponentName';
    const viewport: Viewport = {
      start: mockTimeRange.from.toDate(),
      end: mockTimeRange.to.toDate(),
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
      timeRange: mockTimeRange,
    };
    const mockVideoDate = { random: jest.fn() };
    panelProps.appKitTMDataSource.videoData.mockReturnValue(mockVideoDate);

    render(<VideoPlayer {...props} />);

    expect(panelProps.appKitTMDataSource.videoData).toBeCalledTimes(1);
    expect(panelProps.appKitTMDataSource.videoData).toBeCalledWith(options);
    expect(videoPlayProp).toEqual({ videoData: mockVideoDate, viewport });
    expect(requestUploadProp).toEqual({ videoData: mockVideoDate });
  });
});
