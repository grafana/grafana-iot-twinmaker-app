import React, { useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { DataFrame } from '@grafana/data';
import { v4 as uuid } from 'uuid';
import { isEmpty } from 'lodash';

import {
  ComponentName,
  ComponentPropsType,
  IDataBindingTemplate,
  TwinMakerApiModel,
  ValueType,
  DataBindingLabelKeys,
  IWidgetClickEvent,
  ISelectionChangedEvent,
  KnownComponentType,
  useSceneComposerApi,
} from 'aws-iot-twinmaker-grafana-utils';
import 'aws-iot-twinmaker-grafana-utils/dist/index.css';
import { SceneViewerPropsFromParent } from './interfaces';
import { getStyles } from './styles';
import { getValidHttpUrl, mergeDashboard, updateUrlParams } from './helpers';
import { MERGE_DASHBOARD_TARGET_ID_KEY } from 'common/constants';
import plugin from '../../plugin.json';
import { locationSearchToObject } from '@grafana/runtime';
import { getUrlTempVarName, undecorateName } from 'common/variables';
import { DataStream, DataType } from '@iot-app-kit/core';

const valueTypeToDataType: Record<ValueType, DataType> = {
  string: 'STRING',
  boolean: 'BOOLEAN',
  number: 'NUMBER',
  time: 'STRING',
};

const mapDataFrame = (df: DataFrame): DataStream[] => {
  // Map GetAlarms query dataFrame.
  const componentNameField = df.fields.find((field) => field.name === 'alarmName')?.values.toArray();
  const entityIdField = df.fields.find((field) => field.name === 'entityId')?.values.toArray();
  const alarmStatusField = df.fields.find((field) => field.name === 'alarmStatus')?.values.toArray();
  const timeField = df.fields.find((field) => field.name === 'Time')?.values.toArray();
  const timeFieldIndex = df.fields.findIndex((field) => field.name === 'Time');

  if (!timeField) {
    return [];
  }

  if (componentNameField && entityIdField && alarmStatusField && timeField) {
    const streams: DataStream[] = [];
    alarmStatusField.forEach((status, index) => {
      const labels: Record<string, string> = {
        [DataBindingLabelKeys.entityId]: entityIdField[index],
        [DataBindingLabelKeys.componentName]: componentNameField[index],
        [DataBindingLabelKeys.propertyName]: TwinMakerApiModel.ALARM_BASE_PROPERTY_NAMES.alarmStatus,
      };
      streams.push({
        id: JSON.stringify(labels),
        name: TwinMakerApiModel.ALARM_BASE_PROPERTY_NAMES.alarmStatus,
        dataType: 'STRING',
        data: [{ x: timeField[index], y: status }],
        resolution: 0,
        meta: labels,
      } as any); // new change adding meta field to be released
    });

    return streams;
  }

  const streams: DataStream[] = [];
  df.fields.forEach((f, index) => {
    if (index !== timeFieldIndex) {
      const labels = {
        ...f.labels,
        [DataBindingLabelKeys.propertyName]: f.name,
      };

      streams.push({
        id: JSON.stringify(labels),
        name: f.name,
        dataType: valueTypeToDataType[f.type as ValueType],
        data: f.values
          .toArray()
          .slice()
          .map((value, index) => ({ x: timeField[index], y: value })),
        resolution: 0,
        meta: labels,
      } as any); // new change adding meta field to be released
    }
  });

  return streams;
};

export const SceneViewer = (props: SceneViewerPropsFromParent) => {
  const styles = getStyles(props.width, props.height);
  const id = useMemo(() => uuid(), []);
  const { getSceneNodeByRef, getSelectedSceneNodeRef } = useSceneComposerApi(id);
  const dataStreams = useMemo<DataStream[]>(() => {
    return props.data.series.flatMap((df) => mapDataFrame(df));
  }, [props.data.series]);

  const { search } = useLocation();

  const onWidgetClick = useCallback((objectData: IWidgetClickEvent) => {
    const anchorData =
      objectData.additionalComponentData?.[
        objectData.componentTypes.findIndex((type) => type === KnownComponentType.Tag)
      ];

    if (anchorData) {
      const targetLink = getValidHttpUrl(anchorData.navLink);
      if (targetLink) {
        window.open(targetLink.toString());
      }
    }
  }, []);

  const onSelectionChanged = useCallback(
    (objectData: ISelectionChangedEvent) => {
      const anchorData =
        objectData.additionalComponentData?.[
          objectData.componentTypes.findIndex((type) => type === KnownComponentType.Tag)
        ];

      if (objectData.nodeRef && anchorData) {
        const dashboardId = anchorData?.navLink?.params?.[MERGE_DASHBOARD_TARGET_ID_KEY];
        mergeDashboard(dashboardId).then((options) => {
          updateUrlParams(
            options?.customSelEntityVarName || props.options.customSelEntityVarName,
            options?.customSelCompVarName || props.options.customSelCompVarName,
            options?.customSelPropertyVarName || props.options.customSelPropertyVarName,
            anchorData
          );
        });
      } else {
        updateUrlParams(
          props.options.customSelEntityVarName,
          props.options.customSelCompVarName,
          props.options.customSelPropertyVarName,
          anchorData
        );
      }
    },
    [props.options.customSelEntityVarName, props.options.customSelCompVarName, props.options.customSelPropertyVarName]
  );

  const setRenderer = useCallback(() => {
    // Get variables from the URL
    const queryParams = locationSearchToObject(search || '');

    const selectedEntityValue = props.options.customSelEntityVarName
      ? (queryParams[getUrlTempVarName(props.options.customSelEntityVarName)] as string)
      : undefined;
    const selectedComponentValue = props.options.customSelCompVarName
      ? (queryParams[getUrlTempVarName(props.options.customSelCompVarName)] as string)
      : undefined;
    const selectedPropertyValue = props.options.customSelPropertyVarName
      ? (queryParams[getUrlTempVarName(props.options.customSelPropertyVarName)] as string)
      : undefined;
    let activeCamera = props.options.customInputActiveCamera
      ? (queryParams[getUrlTempVarName(props.options.customInputActiveCamera)] as string)
      : undefined;

    const dataBindingTemplate: IDataBindingTemplate = {};
    if (props.options.customSelEntityVarName && selectedEntityValue) {
      const undecoratedKey = undecorateName(props.options.customSelEntityVarName);
      dataBindingTemplate[undecoratedKey] = selectedEntityValue;
    }
    if (props.options.customSelCompVarName && selectedComponentValue) {
      const undecoratedKey = undecorateName(props.options.customSelCompVarName);
      dataBindingTemplate[undecoratedKey] = selectedComponentValue;
    }
    if (props.options.customSelPropertyVarName && selectedPropertyValue) {
      const undecoratedKey = undecorateName(props.options.customSelPropertyVarName);
      dataBindingTemplate[undecoratedKey] = selectedPropertyValue;
    }

    if (!activeCamera || activeCamera.trim().length === 0) {
      activeCamera = props.options.customInputActiveCamera;
    }

    let selectedDataBinding: Record<string, string> | undefined =
      selectedEntityValue && selectedComponentValue
        ? {
            [DataBindingLabelKeys.entityId]: selectedEntityValue,
            [DataBindingLabelKeys.componentName]: selectedComponentValue,
          }
        : undefined;

    const selectedNode = getSceneNodeByRef(getSelectedSceneNodeRef() || '');
    const tag: any = selectedNode?.components.find((comp) => comp.type === KnownComponentType.Tag);
    const binding = tag?.valueDataBinding?.dataBindingContext;

    // Set the selectedDataBinding values to be empty strings when the currently selected node
    // has tag component and selected entity/component is empty, so that the selected tag node
    // will be deselected.
    if (
      (isEmpty(selectedEntityValue) || isEmpty(selectedComponentValue)) &&
      binding &&
      binding[DataBindingLabelKeys.entityId] &&
      binding[DataBindingLabelKeys.componentName]
    ) {
      selectedDataBinding = {
        [DataBindingLabelKeys.entityId]: '',
        [DataBindingLabelKeys.componentName]: '',
      };
    }

    const staticPluginPath = `public/plugins/${plugin.id}`;

    // Load in WebGLRenderer component
    const webGlRendererProps: ComponentPropsType = {
      mode: 'Viewing',
      sceneFileIdentifiers: {
        workspaceScenePathProps: {
          workspaceId: props.workspaceId!,
          sceneId: props.options.sceneId!,
        },
      },
      dracoDecoder: {
        enable: true,
        path: `${window.location.origin}/${staticPluginPath}/static/draco/`,
      },
      onSelectionChanged,
      onWidgetClick,
      selectedDataBinding,
      dataStreams,
      viewport: {
        start: new Date(props.data.timeRange.from.valueOf()),
        end: new Date(props.data.timeRange.to.valueOf()),
      },
      dataBindingTemplate,
      sceneComposerId: id,
      activeCamera,
    };

    return props.twinMakerUxSdk.createComponentForReact(ComponentName.WebGLRenderer, webGlRendererProps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.options.sceneId, props.width, props.height, props.twinMakerUxSdk, props.data.series, search]);

  return (
    <div
      data-testid={'SceneViewer'}
      // Fit canvas inside panel
      className={styles.wrapper}
    >
      {setRenderer()}
    </div>
  );
};
