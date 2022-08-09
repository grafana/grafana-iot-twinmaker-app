import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { DataFrame } from '@grafana/data';

import {
  ComponentName,
  ComponentPropsType,
  IDataBindingTemplate,
  IDataFrame,
  IDataInput,
  TwinMakerApiModel,
  ValueType,
  DataBindingLabelKeys,
  IDataField,
  IWidgetClickEvent,
  ISelectionChangedEvent,
  KnownComponentType,
} from 'aws-iot-twinmaker-grafana-utils';
import 'aws-iot-twinmaker-grafana-utils/dist/index.css';
import { SceneViewerPropsFromParent } from './interfaces';
import { getStyles } from './styles';
import { getValidHttpUrl, mergeDashboard, updateUrlParams } from './helpers';
import { MERGE_DASHBOARD_TARGET_ID_KEY } from 'common/constants';
import plugin from '../../plugin.json';
import { locationSearchToObject } from '@grafana/runtime';
import { getUrlTempVarName, undecorateName } from 'common/variables';

export const SceneViewer = (props: SceneViewerPropsFromParent) => {
  const styles = getStyles(props.width, props.height);

  const { search } = useLocation();

  const onWidgetClick = useCallback(
    (objectData: IWidgetClickEvent) => {
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
    },
    [props.options.customSelEntityVarName, props.options.customSelCompVarName, props.options.customSelPropertyVarName]
  );

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

  const mapDataFrame = (df: DataFrame): IDataFrame[] => {
    // Map GetAlarms query dataFrame.
    const componentNameField = df.fields.find((field) => field.name === 'alarmName')?.values.toArray();
    const entityIdField = df.fields.find((field) => field.name === 'entityId')?.values.toArray();
    const alarmStatusField = df.fields.find((field) => field.name === 'alarmStatus')?.values.toArray();
    const timeField = df.fields.find((field) => field.name === 'Time')?.values.toArray();

    if (componentNameField && entityIdField && alarmStatusField && timeField) {
      const mappedFrames: IDataFrame[] = [];
      alarmStatusField.forEach((status, index) => {
        const labels = {
          [DataBindingLabelKeys.entityId]: entityIdField[index],
          [DataBindingLabelKeys.componentName]: componentNameField[index],
        };
        const mappedStatus: IDataField = {
          name: TwinMakerApiModel.ALARM_BASE_PROPERTY_NAMES.alarmStatus,
          valueType: 'string',
          values: [status],
          labels,
        };
        const mappedTime: IDataField = {
          name: 'Time',
          valueType: 'time',
          values: [timeField[index]],
          labels,
        };
        mappedFrames.push({
          dataFrameId: df.refId ? `${df.refId}-${index}` : '',
          fields: [mappedStatus, mappedTime],
        });
      });
      return mappedFrames;
    }

    return [
      {
        dataFrameId: df.refId || '',
        fields: df.fields.map((f) => {
          return {
            name: f.name,
            labels: f.labels,
            valueType: f.type as ValueType,
            values: f.values.toArray().slice(),
          };
        }),
      },
    ];
  };

  const createDataInputFrames = (series: DataFrame[]) => {
    const dataFrames: IDataFrame[] = [];
    series.forEach((df) => dataFrames.push(...mapDataFrame(df)));

    return dataFrames;
  };

  const setRenderer = useCallback(() => {
    const dataInput: IDataInput = {
      dataFrames: createDataInputFrames(props.data.series),
      timeRange: {
        from: props.data.timeRange.from.valueOf(),
        to: props.data.timeRange.to.valueOf(),
      },
    };

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

    const selectedDataBinding = {
      [DataBindingLabelKeys.entityId]: selectedEntityValue ?? '',
      [DataBindingLabelKeys.componentName]: selectedComponentValue ?? '',
      [DataBindingLabelKeys.propertyName]: selectedPropertyValue ?? '',
    };

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
      cdnPath: `${window.location.origin}/${staticPluginPath}/static`,
      dracoDecoder: {
        enable: true,
        path: `${window.location.origin}/${staticPluginPath}/static/draco/`,
      },
      onSelectionChanged,
      onWidgetClick,
      selectedDataBinding,
      dataInput,
      dataBindingTemplate,
    };

    console.log('webgl renderer props', webGlRendererProps);

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
