import React, { useCallback } from 'react';
import { ComponentName, ComponentPropsType, VideoData, VideoPlaybackMode } from 'aws-iot-twinmaker-grafana-utils';
import 'aws-iot-twinmaker-grafana-utils/dist/index.css';
import { getStyles } from './styles';
import { VideoPlayerPropsFromParent } from './interfaces';
import { auto } from '@popperjs/core';

export const VideoPlayer = (props: VideoPlayerPropsFromParent) => {
  const styles = getStyles();

  // Automatically update the video player when the related parameters change
  const setVideoPlayer = useCallback(() => {
    // Load in VideoPlayer component
    const videoData = new VideoData({
      workspaceId: props.workspaceId,
      entityId: props.entityId,
      componentName: props.componentName,
      kvsStreamName: props.kvsStreamName,
    });
    const videoPlayerProps: ComponentPropsType = {
      videoData: videoData,
      playbackMode: VideoPlaybackMode.ON_DEMAND,
      startTime: props.timeRange.from.toDate(),
      endTime: props.timeRange.to.toDate(),
    };
    return props.twinMakerUxSdk.createComponentForReact(ComponentName.VideoPlayer, videoPlayerProps);
  }, [
    props.kvsStreamName,
    props.workspaceId,
    props.entityId,
    props.componentName,
    props.timeRange.from,
    props.timeRange.to,
    props.twinMakerUxSdk,
  ]);

  return (
    // Load the video player
    <div
      data-testid={'VideoPlayer'}
      // Fit video player inside panel
      className={styles.wrapper}
      style={{ width: props.width, height: props.height, overflow: auto }}
    >
      {setVideoPlayer()}
    </div>
  );
};
