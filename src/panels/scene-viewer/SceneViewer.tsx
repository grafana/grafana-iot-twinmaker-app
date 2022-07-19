import React, { useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { DataFrame } from '@grafana/data';

import {
  ComponentName,
  ComponentPropsType,
  IDataBindingTemplate,
  IDataFrame,
  IDataInput,
  TwinMakerApiModel,
  TargetObjectData,
  ValueType,
  DataBindingLabelKeys,
  undecorateDataBindingTemplate,
  IDataField,
} from 'aws-iot-twinmaker-grafana-utils';
import 'aws-iot-twinmaker-grafana-utils/dist/index.css';
import { SceneViewerPropsFromParent } from './interfaces';
import { getStyles } from './styles';
import { getValidHttpUrl, mergeDashboard, updateUrlParams } from './helpers';
import { MERGE_DASHBOARD_TARGET_ID_KEY } from 'common/constants';
import plugin from '../../plugin.json';

export const SceneViewer = (props: SceneViewerPropsFromParent) => {
  const styles = getStyles(props.width, props.height);
  const selectedNodeRef = useRef<string>();

  const location = useLocation();
  let updatedBySceneClick = false;

  const getTempVarName = (name: string | undefined) => {
    return name ? (name.indexOf('$') !== -1 ? name : `\$\{${name}\}`) : undefined;
  };

  const onTargetObjectChanged = useCallback(
    (objectData: TargetObjectData) => {
      const anchorData = objectData.data;

      console.log(anchorData);
      if (anchorData?.eventType === 'click') {
        console.log('click', selectedNodeRef);
        selectedNodeRef.current = anchorData.anchorNodeRef;
        const targetLink = getValidHttpUrl(anchorData.navLink);
        if (targetLink) {
          window.open(targetLink.toString());
        }
        updatedBySceneClick = true;
      } else if (anchorData?.eventType === 'change') {
        console.log('change', selectedNodeRef);
        if (anchorData.isSelected) {
          selectedNodeRef.current = anchorData.anchorNodeRef;
          const dashboardId = anchorData.navLink?.params?.[MERGE_DASHBOARD_TARGET_ID_KEY];
          mergeDashboard(dashboardId).then((options) => {
            if (updatedBySceneClick) {
              updateUrlParams(
                options?.customSelEntityVarName || props.options.customSelEntityVarName,
                options?.customSelCompVarName || props.options.customSelCompVarName,
                options?.customSelPropertyVarName || props.options.customSelPropertyVarName,
                anchorData
              );
              updatedBySceneClick = false;
            }
          });
        } else {
          if (selectedNodeRef.current === anchorData.anchorNodeRef) {
            selectedNodeRef.current = undefined;
            if (updatedBySceneClick) {
              updateUrlParams(
                props.options.customSelEntityVarName,
                props.options.customSelCompVarName,
                props.options.customSelPropertyVarName,
                anchorData
              );
              updatedBySceneClick = false;
            }
          }
        }
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

    let selectedEntityValue, selectedComponentValue, selectedPropertyValue;
    const varSplit = location.search.split('&var-');
    varSplit.forEach((variable) => {
      if (props.options.customSelEntityVarName && variable.includes(props.options.customSelEntityVarName)) {
        selectedEntityValue = variable.split(`${props.options.customSelEntityVarName}=`)[1];
      } else if (props.options.customSelCompVarName && variable.includes(props.options.customSelCompVarName)) {
        selectedComponentValue = variable.split(`${props.options.customSelCompVarName}=`)[1];
      } else if (props.options.customSelPropertyVarName && variable.includes(props.options.customSelPropertyVarName)) {
        selectedPropertyValue = variable.split(`${props.options.customSelPropertyVarName}=`)[1];
      }
    });

    const entityVarName = getTempVarName(props.options.customSelEntityVarName);
    // const selectedEntityValue = entityVarName ? props.replaceVariables(entityVarName) : undefined;
    const componentVarName = getTempVarName(props.options.customSelCompVarName);
    // const selectedComponentValue = componentVarName ? props.replaceVariables(componentVarName) : undefined;
    const propertyVarName = getTempVarName(props.options.customSelPropertyVarName);
    // const selectedPropertyValue = propertyVarName ? props.replaceVariables(propertyVarName) : undefined;

    const dataBindingTemplate: IDataBindingTemplate = {};
    if (entityVarName && selectedEntityValue) {
      const undecoratedKey = undecorateDataBindingTemplate(entityVarName);
      dataBindingTemplate[undecoratedKey] = selectedEntityValue;
    }
    if (componentVarName && selectedComponentValue) {
      const undecoratedKey = undecorateDataBindingTemplate(componentVarName);
      dataBindingTemplate[undecoratedKey] = selectedComponentValue;
    }
    if (propertyVarName && selectedPropertyValue) {
      const undecoratedKey = undecorateDataBindingTemplate(propertyVarName);
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
      onTargetObjectChanged,
      selectedDataBinding,
      dataInput,
      dataBindingTemplate,
    };

    console.log('webgl renderer props', webGlRendererProps);

    return props.twinMakerUxSdk.createComponentForReact(ComponentName.WebGLRenderer, webGlRendererProps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.options.sceneId, props.width, props.height, props.twinMakerUxSdk, props.data.series, location]);

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
