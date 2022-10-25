import React, { useEffect, useState } from 'react';
import { ComponentName, ComponentPropsType } from 'aws-iot-twinmaker-grafana-utils';
import 'aws-iot-twinmaker-grafana-utils/dist/index.css';
import { getStyles } from './styles';
import { VideoPlayerPropsFromParent } from './interfaces';
import { auto } from '@popperjs/core';
import { getTemplateSrv, locationSearchToObject } from '@grafana/runtime';
import { getUrlTempVarName, tempVarSyntax } from 'common/variables';
import { useLocation } from 'react-router-dom';
import { UrlQueryMap } from '@grafana/data';

export const VideoPlayer = (props: VideoPlayerPropsFromParent) => {
  const styles = getStyles();
  const templateSrv = getTemplateSrv();

  const { search } = useLocation();

  const [videoPlayer, setVideoPlayer] = useState();
  const [displayOptions, setDisplayOptions] = useState({
    entityId: '',
    componentName: '',
    kvsStreamName: '',
    search: search,
    startTime: '',
    endTime: '',
  });

  // Get the value from a template variable
  const checkTempVar = (displayOption: string) => {
    const displayOptionVar = tempVarSyntax(displayOption);
    const value = templateSrv.replace(displayOptionVar);
    // Not a template var if templateSrv.replace returns the same value
    return value === displayOptionVar ? displayOption : value;
  };

  // Get display option value from the URL, or check default variable values
  const getDisplayOptionValue = (queryParams: UrlQueryMap, displayOption: string) => {
    return (queryParams[getUrlTempVarName(displayOption)] as string) ?? checkTempVar(displayOption);
  };

  useEffect(() => {
    const queryParams = locationSearchToObject(search || '');
    const entityId = getDisplayOptionValue(queryParams, props.options.entityId);
    const componentName = getDisplayOptionValue(queryParams, props.options.componentName);
    const kvsStreamName = getDisplayOptionValue(queryParams, props.options.kvsStreamName);
    const startTime = getDisplayOptionValue(queryParams, props.timeRange.from.toString());
    const endTime = getDisplayOptionValue(queryParams, props.timeRange.to.toString());

    // Component should update if any display option values changed
    let shouldUpdate = false;
    if (
      entityId !== displayOptions.entityId ||
      componentName !== displayOptions.componentName ||
      kvsStreamName !== displayOptions.kvsStreamName ||
      startTime !== displayOptions.startTime ||
      endTime !== displayOptions.endTime
    ) {
      shouldUpdate = true;
      setDisplayOptions({
        entityId,
        componentName,
        kvsStreamName,
        search,
        startTime,
        endTime,
      });
    } else if (search === displayOptions.search) {
      // If the URL didn't change then another field was updated and the video player should rerender
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      // Load in VideoPlayer component
      const videoPlayerProps: ComponentPropsType = {
        workspaceId: props.workspaceId,
        entityId,
        componentName,
        kvsStreamName,
        playbackMode: 'ON_DEMAND',
        startTime: props.timeRange.from.toDate(),
        endTime: props.timeRange.to.toDate(),
      };
      setVideoPlayer(props.twinMakerUxSdk.createComponentForReact(ComponentName.VideoPlayer, videoPlayerProps));
    }
  }, [
    props.options.kvsStreamName,
    props.workspaceId,
    props.options.entityId,
    props.options.componentName,
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
      {videoPlayer}
    </div>
  );
};
