import React, { useCallback, useState } from 'react';
import { ComponentName, ComponentPropsType, VideoData, VideoPlaybackMode } from 'aws-iot-twinmaker-grafana-utils';
import 'aws-iot-twinmaker-grafana-utils/dist/index.css';
import { getStyles } from './styles';
import { VideoPlayerPropsFromParent } from './interfaces';
import { auto } from '@popperjs/core';
import { getTemplateSrv, locationSearchToObject } from '@grafana/runtime';
import { getUrlTempVarName, tempVarSyntax } from 'common/variables';
import { useLocation } from 'react-router-dom';

export const VideoPlayer = (props: VideoPlayerPropsFromParent) => {
  const styles = getStyles();
  const templateSrv = getTemplateSrv();

  const { search } = useLocation();

  // Automatically update the video player when the related parameters change
  const setVideoPlayer = useCallback(() => {
    // Get variables from the URL
    const queryParams = locationSearchToObject(search || '');
    let entityId = queryParams[getUrlTempVarName(props.options.entityId)] as string;
    let componentName = queryParams[getUrlTempVarName(props.options.componentName)] as string;
    let kvsStreamName = queryParams[getUrlTempVarName(props.options.kvsStreamName)] as string;

    // Double check default variable values if url is empty
    if (!entityId) {
      entityId = templateSrv.replace(tempVarSyntax(props.options.entityId));
    }
    if (!componentName) {
      componentName = templateSrv.replace(tempVarSyntax(props.options.componentName));
    }
    if (!kvsStreamName) {
      kvsStreamName = templateSrv.replace(tempVarSyntax(props.options.kvsStreamName));
    }

    // Load in VideoPlayer component
    const videoData = new VideoData({
      workspaceId: props.workspaceId,
      entityId,
      componentName,
      kvsStreamName,
      kinesisVideoArchivedMediaClient: props.twinMakerUxSdk.awsClients.kinesisVideoArchivedMediaV3(),
      kinesisVideoClient: props.twinMakerUxSdk.awsClients.kinesisVideoV3(),
      siteWiseClient: props.twinMakerUxSdk.awsClients.siteWiseV3(),
      twinMakerClient: props.twinMakerUxSdk.awsClients.iotTwinMakerV3(),
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
    search,
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
