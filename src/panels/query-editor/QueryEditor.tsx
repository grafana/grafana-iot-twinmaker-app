import React from 'react';
import 'aws-iot-twinmaker-grafana-utils/dist/index.css';

import { QueryEditorPropsFromParent } from './interfaces';
import { QueryBuilder } from 'aws-iot-twinmaker-grafana-utils';
import { CustomScrollbar } from '@grafana/ui';

export const QueryEditor = (props: QueryEditorPropsFromParent) => {
  return (
    <CustomScrollbar>
      <QueryBuilder workspaceId={props.workspaceId} awsConfig={props.awsConfig} />
    </CustomScrollbar>
  );
};
