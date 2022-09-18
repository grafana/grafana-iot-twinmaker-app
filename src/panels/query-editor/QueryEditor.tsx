import React from 'react';
import 'aws-iot-twinmaker-grafana-utils/dist/index.css';
import { getStyles } from './styles';
import { QueryEditorPropsFromParent } from './interfaces';
import { QueryEditorWrapper, IQueryEditorProps } from 'aws-iot-twinmaker-grafana-utils';

export const QueryEditor = (props: QueryEditorPropsFromParent & IQueryEditorProps) => {
  const styles = getStyles();

  return (
    <div data-testid={'QueryEditor'} className={styles.wrapper}>
      <QueryEditorWrapper workspaceId={props.workspaceId} awsConfig={props.awsConfig} />
    </div>
  );
};
