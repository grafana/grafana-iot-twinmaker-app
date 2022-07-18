import React, { useCallback, useEffect, useRef, useState } from 'react';
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

(() => {
  let oldReplaceState = history.replaceState;
  history.replaceState = function replaceState() {
    let ret = oldReplaceState.apply(this, arguments as any);
    window.dispatchEvent(new Event('urlupdate'));
    return ret;
  };
})();

export const SceneViewer = (props: SceneViewerPropsFromParent) => {
  const styles = getStyles(props.width, props.height);
  const selectedNodeRef = useRef<string>();

  const [selectedVarData, setSelectedVarData] = useState<{ [x: string]: string }>({});

  const getTempVarName = (name: string) => {
    return name.indexOf('$') !== -1 ? name : `\$\{${name}\}`;
  };

  const updateSelectedVarData = useCallback(() => {
    const newSelectedVarData: { [x: string]: string } = {};
    let selectedEntityValue, selectedComponentValue, selectedPropertyValue;
    if (props.options.customSelEntityVarName) {
      const entityVarName = getTempVarName(props.options.customSelEntityVarName);
      selectedEntityValue = props.replaceVariables(entityVarName);
      newSelectedVarData[props.options.customSelEntityVarName] = selectedEntityValue;
    }
    if (props.options.customSelCompVarName) {
      const componentVarName = getTempVarName(props.options.customSelCompVarName);
      selectedComponentValue = props.replaceVariables(componentVarName);
      newSelectedVarData[props.options.customSelCompVarName] = selectedComponentValue;
    }
    if (props.options.customSelPropertyVarName) {
      const propertyVarName = getTempVarName(props.options.customSelPropertyVarName);
      selectedPropertyValue = props.replaceVariables(propertyVarName);
      newSelectedVarData[props.options.customSelPropertyVarName] = selectedPropertyValue;
    }
    setSelectedVarData(newSelectedVarData);
  }, []);

  useEffect(() => {
    window.addEventListener('urlupdate', updateSelectedVarData);

    return () => window.removeEventListener('urlupdate', updateSelectedVarData);
  }, [
    props.options.customSelEntityVarName,
    props.options.customSelCompVarName,
    props.options.customSelPropertyVarName,
  ]);

  const onTargetObjectChanged = useCallback(
    (objectData: TargetObjectData) => {
      const anchorData = objectData.data;

      if (anchorData?.eventType === 'click') {
        selectedNodeRef.current = anchorData.anchorNodeRef;
        const targetLink = getValidHttpUrl(anchorData.navLink);
        if (targetLink) {
          window.open(targetLink.toString());
        }
      } else if (anchorData?.eventType === 'change') {
        if (anchorData.isSelected) {
          selectedNodeRef.current = anchorData.anchorNodeRef;
          const dashboardId = anchorData.navLink?.params?.[MERGE_DASHBOARD_TARGET_ID_KEY];
          mergeDashboard(dashboardId).then((options) => {
            updateUrlParams(
              options?.customSelEntityVarName || props.options.customSelEntityVarName,
              options?.customSelCompVarName || props.options.customSelCompVarName,
              options?.customSelPropertyVarName || props.options.customSelPropertyVarName,
              anchorData
            );
          });
        } else {
          if (selectedNodeRef.current === anchorData.anchorNodeRef) {
            selectedNodeRef.current = undefined;
            updateUrlParams(
              props.options.customSelEntityVarName,
              props.options.customSelCompVarName,
              props.options.customSelPropertyVarName,
              anchorData
            );
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

    const dataBindingTemplate: IDataBindingTemplate = {};
    if (props.options.customSelEntityVarName && selectedVarData[props.options.customSelEntityVarName]) {
      const undecoratedKey = undecorateDataBindingTemplate(props.options.customSelEntityVarName);
      dataBindingTemplate[undecoratedKey] = selectedVarData[props.options.customSelEntityVarName];
    }
    if (props.options.customSelCompVarName && selectedVarData[props.options.customSelCompVarName]) {
      const undecoratedKey = undecorateDataBindingTemplate(props.options.customSelCompVarName);
      dataBindingTemplate[undecoratedKey] = selectedVarData[props.options.customSelCompVarName];
    }
    if (props.options.customSelPropertyVarName && selectedVarData[props.options.customSelPropertyVarName]) {
      const undecoratedKey = undecorateDataBindingTemplate(props.options.customSelPropertyVarName);
      dataBindingTemplate[undecoratedKey] = selectedVarData[props.options.customSelPropertyVarName];
    }

    const selectedDataBinding = {
      [DataBindingLabelKeys.entityId]: props.options.customSelEntityVarName
        ? selectedVarData[props.options.customSelEntityVarName]
        : '',
      [DataBindingLabelKeys.componentName]: props.options.customSelCompVarName
        ? selectedVarData[props.options.customSelCompVarName]
        : '',
      [DataBindingLabelKeys.propertyName]: props.options.customSelPropertyVarName
        ? selectedVarData[props.options.customSelPropertyVarName]
        : '',
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
  }, [props.options.sceneId, props.width, props.height, props.twinMakerUxSdk, props.data.series, selectedVarData]);

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
