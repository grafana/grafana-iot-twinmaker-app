import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getStyles } from './styles';
import { VideoPlayerPropsFromParent } from './interfaces';
import { auto } from '@popperjs/core';
import { locationSearchToObject } from '@grafana/runtime';
import { getUrlTempVarName, tempVarSyntax } from 'common/variables';
import { useLocation } from 'react-router-dom';
import { UrlQueryMap } from '@grafana/data';
import { Viewport } from '@iot-app-kit/core';
import { VideoData } from '@iot-app-kit/source-iottwinmaker';
import { RequestVideoUpload, VideoPlayer as VideoPlayerComp } from '@iot-app-kit/react-components';

export const VideoPlayer = (props: VideoPlayerPropsFromParent) => {
  const { replaceVariables } = props;
  const styles = getStyles();

  const { search } = useLocation();

  const [videoData, setVideoData] = useState<VideoData>();
  const [displayOptions, setDisplayOptions] = useState({
    entityId: '',
    componentName: '',
    kvsStreamName: '',
    search: search,
    startTime: '',
    endTime: '',
  });

  // Get the value from a template variable
  const checkTempVar = useCallback(
    (displayOption: string) => {
      const displayOptionVar = tempVarSyntax(displayOption);
      const value = replaceVariables(displayOptionVar);
      // Not a template var if templateSrv.replace returns the same value
      return value === displayOptionVar ? displayOption : value;
    },
    [replaceVariables]
  );

  // Get display option value from the URL, or check default variable values
  const getDisplayOptionValue = useCallback(
    (queryParams: UrlQueryMap, displayOption: string) => {
      return (queryParams[getUrlTempVarName(displayOption || '')] as string) ?? checkTempVar(displayOption);
    },
    [checkTempVar]
  );

  const viewport: Viewport = useMemo(() => {
    return {
      start: new Date(props.timeRange.from.valueOf()),
      end: new Date(props.timeRange.to.valueOf()),
    };
  }, [props.timeRange.from, props.timeRange.to]);

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
      setVideoData(
        props.appKitTMDataSource.videoData({
          entityId,
          componentName,
          kvsStreamName,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.options.kvsStreamName,
    props.workspaceId,
    props.options.entityId,
    props.options.componentName,
    props.timeRange.from,
    props.timeRange.to,
    props.appKitTMDataSource,
    getDisplayOptionValue,
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
      {videoData && <VideoPlayerComp videoData={videoData} viewport={viewport} />}
      {videoData && <RequestVideoUpload videoData={videoData} />}
    </div>
  );
};
