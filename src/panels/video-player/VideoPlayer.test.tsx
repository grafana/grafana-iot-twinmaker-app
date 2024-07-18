import React from 'react';
import { render } from '@testing-library/react';
import { mockTwinMakerPanelProps, mockTimeRange, mockGrafanaUI } from '../tests/utils/__mocks__';

mockGrafanaUI();
jest.mock('react-router-dom', () => ({
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

const mockVideoPlayer = jest.fn();
const mockRequestUpload = jest.fn();

jest.mock('@iot-app-kit/react-components', () => ({
  VideoPlayer: class MockVideoPlayer extends React.PureComponent {
    constructor(props: any) {
      super(props);
      mockVideoPlayer(props);
    }
    render() {
      return <div></div>;
    }
  },
  RequestVideoUpload: class MockRequestVideoUpload extends React.PureComponent {
    constructor(props: any) {
      super(props);
      mockRequestUpload(props);
    }
    render() {
      return <div></div>;
    }
  },
}));

import { VideoPlayer } from './VideoPlayer';
import { VideoPlayerPropsFromParent } from './interfaces';
import { mockDisplayOptions } from './tests/common';
import { Viewport } from '@iot-app-kit/core';

describe('VideoPlayer', () => {
  it('should load VideoPlayer component when providing kvsStreamName', () => {
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
      replaceVariables: (v: string) => v,
    };
    const mockVideoDate = { random: jest.fn() };
    panelProps.appKitTMDataSource.videoData.mockReturnValue(mockVideoDate);

    render(<VideoPlayer {...props} />);

    expect(panelProps.appKitTMDataSource.videoData).toHaveBeenCalledTimes(1);
    expect(panelProps.appKitTMDataSource.videoData).toHaveBeenCalledWith(options);
    expect(mockVideoPlayer).toHaveBeenCalledWith(expect.objectContaining({ videoData: mockVideoDate, viewport }));
    expect(mockRequestUpload).toHaveBeenCalledWith(expect.objectContaining({ videoData: mockVideoDate }));
  });
});
