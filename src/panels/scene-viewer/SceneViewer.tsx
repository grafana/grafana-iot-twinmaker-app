import React, { useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { DataFrame, UrlQueryMap } from '@grafana/data';
import { v4 as uuid } from 'uuid';
import { isEmpty } from 'lodash';

import { TwinMakerApiModel } from 'aws-iot-twinmaker-grafana-utils';
import { SceneViewerPropsFromParent } from './interfaces';
import { getStyles } from './styles';
import { getValidHttpUrl, updateUrlParams } from './helpers';
import plugin from '../../plugin.json';
import { locationSearchToObject } from '@grafana/runtime';
import { getUrlTempVarName, tempVarSyntax, undecorateName } from 'common/variables';
import { DataStream, DataType, Viewport } from '@iot-app-kit/core';
import {
  SceneViewer as SceneViewerComp,
  ValueType,
  DataBindingLabelKeys,
  IDataBindingTemplate,
  KnownComponentType,
  IWidgetClickEvent,
  ISelectionChangedEvent,
  useSceneComposerApi,
  ITagData,
  ISelectedDataBinding,
} from '@iot-app-kit/scene-composer';

const valueTypeToDataType: Record<ValueType, DataType> = {
  string: 'STRING',
  boolean: 'BOOLEAN',
  number: 'NUMBER',
  time: 'STRING',
};

const mapDataFrame = (df: DataFrame): DataStream[] => {
  // Map GetAlarms query dataFrame.
  const componentNameField = df.fields.find((field) => field.name === 'alarmName')?.values;
  const entityIdField = df.fields.find((field) => field.name === 'entityId')?.values;
  const alarmStatusField = df.fields.find((field) => field.name === 'alarmStatus')?.values;
  const timeField = df.fields.find((field) => field.name === 'Time')?.values;
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
    if (index !== timeFieldIndex && f.labels) {
      const labels = {
        ...f.labels,
      };

      streams.push({
        id: JSON.stringify(labels),
        name: f.labels.propertyName,
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
  const dataStreams = useMemo<DataStream[] | undefined>(() => {
    const streams =  props.data.series.flatMap((df) => mapDataFrame(df));
    return props.options.enableAutoQuery ? undefined : streams;
  }, [props.data.series, props.options.enableAutoQuery]);

  const { search } = useLocation();
  const { replaceVariables } = props;

  // Get the value from a template variable
  const checkTempVar = useCallback(
    (displayOption: string) => {
      const displayOptionVar = tempVarSyntax(displayOption);
      const value = replaceVariables(displayOptionVar);
      // Not a template var if replaceVariables returns the same value
      return value === displayOptionVar ? displayOption : value;
    },
    [replaceVariables]
  );

  // Get display option value from the URL, or check default variable values
  const getDisplayOptionValue = useCallback(
    (queryParams: UrlQueryMap, displayOption: string): string => {
      const tempVarName = getUrlTempVarName(displayOption || '');
      const tempVarVal = checkTempVar(displayOption);
      const tempVarURLVal = queryParams[tempVarName];
      return tempVarVal ?? tempVarURLVal;
    },
    [checkTempVar]
  );

  const sceneLoader = useMemo(() => {
    const loader = props.appKitTMDataSource.s3SceneLoader(props.options.sceneId);

    return loader;
  }, [props.appKitTMDataSource, props.options.sceneId]);

  const sceneMetadataModule = useMemo(() => {
    const sceneMetadataModuleFromDataSource = props.appKitTMDataSource.sceneMetadataModule(props.options.sceneId);

    return sceneMetadataModuleFromDataSource;
  }, [props.appKitTMDataSource, props.options.sceneId]);

  const valueDataBindingProviders = useMemo(() => {
    const valueDataBindingProvidersFromDataSource = props.appKitTMDataSource.valueDataBindingProviders();

    return valueDataBindingProvidersFromDataSource;
  }, [props.appKitTMDataSource]);

  const onWidgetClick = useCallback((objectData: IWidgetClickEvent) => {
    const anchorData = objectData.additionalComponentData?.[
      objectData.componentTypes.findIndex((type) => type === KnownComponentType.Tag)
    ] as ITagData | undefined;

    if (anchorData) {
      const targetLink = getValidHttpUrl(anchorData.navLink);
      if (targetLink) {
        window.open(targetLink.toString());
      }
    }
  }, []);

  const onSelectionChanged = useCallback(
    (objectData: ISelectionChangedEvent) => {
      const anchorData = objectData.additionalComponentData?.[
        objectData.componentTypes.findIndex((type) => type === KnownComponentType.Tag)
      ] as ITagData | undefined;
        updateUrlParams(
          props.options.customSelEntityVarName,
          props.options.customSelCompVarName,
          props.options.customSelPropertyVarName,
          anchorData
        );
      },
    [props.options.customSelEntityVarName, props.options.customSelCompVarName, props.options.customSelPropertyVarName]
  );

  const dataBindingTemplate: IDataBindingTemplate = useMemo(() => {
    // Get variables from the URL
    const queryParams = locationSearchToObject(search || '');

    // Don't use getDisplayOptionValue because we want to strictly use the values set in the URL
    // Ensure deselect doesn't resolve to the previously saved value for the dashboard
    const selectedEntityValue = props.options.customSelEntityVarName
      ? (queryParams[getUrlTempVarName(props.options.customSelEntityVarName)] as string)
      : undefined;
    const selectedComponentValue = props.options.customSelCompVarName
      ? (queryParams[getUrlTempVarName(props.options.customSelCompVarName)] as string)
      : undefined;
    const selectedPropertyValue = props.options.customSelPropertyVarName
      ? (queryParams[getUrlTempVarName(props.options.customSelPropertyVarName)] as string)
      : undefined;

    const template: IDataBindingTemplate = {};
    if (props.options.customSelEntityVarName && selectedEntityValue) {
      const undecoratedKey = undecorateName(props.options.customSelEntityVarName);
      template[undecoratedKey] = selectedEntityValue;
    }
    if (props.options.customSelCompVarName && selectedComponentValue) {
      const undecoratedKey = undecorateName(props.options.customSelCompVarName);
      template[undecoratedKey] = selectedComponentValue;
    }
    if (props.options.customSelPropertyVarName && selectedPropertyValue) {
      const undecoratedKey = undecorateName(props.options.customSelPropertyVarName);
      template[undecoratedKey] = selectedPropertyValue;
    }

    return template;
  }, [
    props.options.customSelEntityVarName,
    props.options.customSelCompVarName,
    props.options.customSelPropertyVarName,
    search,
  ]);

  const selectedDataBinding = useMemo(() => {
    // Get variables from the URL
    const queryParams = locationSearchToObject(search || '');

    // Don't use getDisplayOptionValue because we want to strictly use the values set in the URL
    // Ensure deselect doesn't resolve to the previously saved value for the dashboard
    const selectedEntityValue = props.options.customSelEntityVarName
      ? (queryParams[getUrlTempVarName(props.options.customSelEntityVarName)] as string)
      : undefined;
    const selectedComponentValue = props.options.customSelCompVarName
      ? (queryParams[getUrlTempVarName(props.options.customSelCompVarName)] as string)
      : undefined;

    let selectedDataBindingResult: ISelectedDataBinding | undefined =
      selectedEntityValue && selectedComponentValue
        ? {
            entityId: selectedEntityValue,
            componentName: selectedComponentValue,
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
      selectedDataBindingResult = {
        entityId: '',
        componentName: '',
      };
    }

    return selectedDataBindingResult;
    // getSceneNodeByRef and getSelectedSceneNodeRef are not required to in dependencies list to avoid unexpected updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, search, props.options.customSelCompVarName, props.options.customSelEntityVarName]);

  const staticPluginPath = useMemo(() => `public/plugins/${plugin.id}`, []);

  const viewerConfig = useMemo(() => {
    const interval = props.options.queryRefreshInterval !== undefined ? props.options.queryRefreshInterval * 1000 : undefined;

    return {
      dracoDecoder: {
        enable: true,
        path: `${window.location.origin}/${staticPluginPath}/static/draco/`,
      },
      basisuDecoder: {
        enable: true,
        path: `${window.location.origin}/${staticPluginPath}/static/basisu/`,
      },
      featureConfig: {
        AutoQuery: true,
        DynamicScene: true,
      },
      dataBindingQueryRefreshRate: interval
    };
  }, [staticPluginPath, props.options.queryRefreshInterval]);

  const viewport: Viewport = useMemo(() => {
    const from = props.data.timeRange.from.valueOf();
    const to = props.data.timeRange.to.valueOf();
    const fromRaw = props.timeRange.raw.from;
    const toRaw = props.timeRange.raw.to;

    if (typeof fromRaw === 'string' && typeof toRaw === 'string' && fromRaw.includes('now') && toRaw.includes('now')) {
      const duration = to - from;
      return {
        duration
      };
    }

    return {
      start: new Date(from),
      end: new Date(to),
    };
  }, [props.data.timeRange.from, props.data.timeRange.to, props.timeRange.raw.from, props.timeRange.raw.to]);

  const activeCamera = useMemo(() => {
    const queryParams = locationSearchToObject(search || '');

    // Use getDisplayOptionValue because this field acts more like a display setting of the panel
    // Can save the default setting when loading the dashboard
    return props.options.customInputActiveCamera
      ? getDisplayOptionValue(queryParams, props.options.customInputActiveCamera)
      : undefined;
  }, [getDisplayOptionValue, props.options.customInputActiveCamera, search]);

  const externalLibraryConfig = {
    matterport: {
      assetBase: `/${staticPluginPath}/static/matterport`,
    },
  };

  return (
    <div
      data-testid={'SceneViewer'}
      // Fit canvas inside panel
      className={styles.wrapper}
    >
      <SceneViewerComp
        sceneLoader={sceneLoader}
        sceneMetadataModule={sceneMetadataModule}
        onSelectionChanged={onSelectionChanged}
        selectedDataBinding={selectedDataBinding}
        dataBindingTemplate={dataBindingTemplate}
        sceneComposerId={id}
        onWidgetClick={onWidgetClick}
        config={viewerConfig}
        dataStreams={dataStreams}
        viewport={viewport}
        activeCamera={activeCamera}
        externalLibraryConfig={externalLibraryConfig}
        valueDataBindingProviders={valueDataBindingProviders}
      />
    </div>
  );
};
