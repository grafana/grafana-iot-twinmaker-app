import React, { useCallback, useRef } from 'react';
import { DataFrame } from '@grafana/data';

import {
  ComponentName,
  ComponentPropsType,
  IAwsState,
  IDataBindingTemplate,
  IDataFrame,
  IDataInput,
  TwinMakerApiModel,
  TargetObjectData,
  ValueType,
  awsActions,
  DataBindingLabelKeys,
  undecorateDataBindingTemplate,
} from 'aws-iot-twinmaker-grafana-utils';
import 'aws-iot-twinmaker-grafana-utils/dist/index.css';
import { SceneViewerPropsFromParent } from './interfaces';
import { getStyles } from './styles';
import { connect, ConnectedProps } from 'react-redux';
import { getValidHttpUrl, mergeDashboard, updateUrlParams } from './helpers';
import { MERGE_DASHBOARD_TARGET_ID_KEY } from 'common/constants';
import plugin from '../../plugin.json';
import { useEffectOnce } from 'react-use';
import { isEmpty } from 'lodash';

// State from Redux and Props from Grafana
const mapStateToProps = (state: { aws: IAwsState }, props: SceneViewerPropsFromParent) => {
  return {
    options: props.options,
    width: props.width,
    height: props.height,
    twinMakerUxSdk: props.twinMakerUxSdk,
    workspaceId: props.workspaceId,
    data: props.data,
    alarms: state.aws.alarm.alarms,
    isFetchingAlarms: state.aws.alarm.apiStatuses.getAlarms.isLoading,
    replaceVariables: props.replaceVariables,
    selectedEntityVarName: props.options.customSelEntityVarName,
    selectedComponentVarName: props.options.customSelCompVarName,
  };
};

const connector = connect(mapStateToProps);

export type SceneViewerProps = ConnectedProps<typeof connector>;

export const SceneViewer = (props: SceneViewerProps) => {
  const styles = getStyles(props.width, props.height);
  const selectedNodeRef = useRef<string>();

  useEffectOnce(() => {
    if (!props.isFetchingAlarms && isEmpty(props.alarms)) {
      props.twinMakerUxSdk.awsStore.dispatchAwsAction(awsActions.getAlarms(props.workspaceId));
    }
  });

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
              options?.customSelEntityVarName || props.selectedEntityVarName,
              options?.customSelCompVarName || props.selectedComponentVarName,
              anchorData
            );
          });
        } else {
          if (selectedNodeRef.current === anchorData.anchorNodeRef) {
            selectedNodeRef.current = undefined;
            updateUrlParams(props.selectedEntityVarName, props.selectedComponentVarName, anchorData);
          }
        }
      }
    },
    [props.selectedEntityVarName, props.selectedComponentVarName]
  );

  const mapDataFrame = useCallback(
    (df: DataFrame): IDataFrame => {
      return {
        dataFrameId: df.refId || '',
        fields: df.fields.map((f) => {
          let labels = f.labels;
          if (f.labels && !isEmpty(f.labels)) {
            const alarmKey = f.labels[TwinMakerApiModel.ALARM_BASE_PROPERTY_NAMES.alarmKey];
            const componentTypeId = f.labels[DataBindingLabelKeys.componentTypeId];

            if (!f.labels?.[DataBindingLabelKeys.entityId] && componentTypeId && alarmKey) {
              Object.keys(props.alarms[alarmKey] || {}).find((entityId) => {
                Object.keys(props.alarms[alarmKey][entityId]).find((componentName) => {
                  // @ts-expect-error
                  if (props.alarms[alarmKey][entityId][componentName].componentTypeId === componentTypeId) {
                    labels = {
                      ...labels,
                      [DataBindingLabelKeys.entityId]: entityId,
                      [DataBindingLabelKeys.componentName]: componentName,
                    };
                    return true;
                  }
                  return false;
                });
              });
            }
          }
          return {
            name: f.name,
            labels,
            valueType: f.type as ValueType,
            values: f.values.toArray().slice(),
          };
        }),
      };
    },
    [props.alarms]
  );

  const createDataInputFrames = (series: DataFrame[]) => {
    const dataFrames: IDataFrame[] = [];
    series.forEach((df) => dataFrames.push(mapDataFrame(df)));

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

    const selectedEntityVar = props.selectedEntityVarName
      ? props.replaceVariables(props.selectedEntityVarName)
      : undefined;
    const selectedComponentVar = props.selectedComponentVarName
      ? props.replaceVariables(props.selectedComponentVarName)
      : undefined;

    const dataBindingTemplate: IDataBindingTemplate = {};
    if (props.selectedEntityVarName && selectedEntityVar) {
      const undecoratedKey = undecorateDataBindingTemplate(props.selectedEntityVarName);
      dataBindingTemplate[undecoratedKey] = selectedEntityVar;
    }
    if (props.selectedComponentVarName && selectedComponentVar) {
      const undecoratedKey = undecorateDataBindingTemplate(props.selectedComponentVarName);
      dataBindingTemplate[undecoratedKey] = selectedComponentVar;
    }

    const selectedDataBinding = {
      [DataBindingLabelKeys.entityId]: selectedEntityVar ?? '',
      [DataBindingLabelKeys.componentName]: selectedComponentVar ?? '',
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
  }, [props.options.sceneId, props.width, props.height, props.twinMakerUxSdk, props.data.series, props.alarms]);

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

export const SceneViewerConnected = connector(SceneViewer);
