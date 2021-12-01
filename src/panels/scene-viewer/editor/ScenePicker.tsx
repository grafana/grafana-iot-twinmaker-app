import React, { PureComponent } from 'react';
import { css } from '@emotion/css';
import { Select, stylesFactory } from '@grafana/ui';
import { StandardEditorProps, GrafanaTheme, SelectableValue } from '@grafana/data';

import { config } from '@grafana/runtime';
import { PanelOptions } from '../types';
import { TwinMakerDataSource } from 'datasource/datasource';
import { getTwinMakerDatasource } from 'common/datasourceSrv';
import { getSelectionInfo } from 'common/info/info';
import { SelectableQueryResults } from 'common/info/types';

type Props = StandardEditorProps<string, unknown, PanelOptions>;

interface State {
  datasource?: TwinMakerDataSource;
  scenes?: SelectableQueryResults;
}

export class ScenePicker extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.initTwinMakerDatasource();
  }

  componentDidUpdate(prevProps: Props) {
    const options = this.props.context?.options;
    const prev = prevProps.context?.options;
    if (options?.datasource !== prev?.datasource || options?.sceneId !== prev?.sceneId) {
      this.initTwinMakerDatasource();
    }
  }

  // Called when datasource changes (not often!)
  initTwinMakerDatasource = async () => {
    const options = this.props.context?.options;
    const ds = await getTwinMakerDatasource(options?.datasource);
    if (ds && ds.getWorkspaceId()) {
      try {
        const scenes = await ds.info.listScenes();
        this.setState({
          datasource: ds,
          scenes,
        });
      } catch (err: any) {
        err.isHandled = true;
      }
    } else {
      this.setState({
        datasource: ds,
      });
    }
  };

  onSceneChanged = (event?: SelectableValue<string>) => {
    this.props.onChange(event?.value);
  };

  onSceneTyped = (value: string) => {
    this.props.onChange(value);
  };

  render() {
    const style = getStyles(config.theme);
    const scene = getSelectionInfo(this.props.value, this.state.scenes);

    return (
      <>
        <div className={style.dropWrap}>
          <Select
            menuShouldPortal={true}
            placeholder="Select scene"
            value={scene.current}
            options={scene.options}
            className="width-30"
            onChange={this.onSceneChanged}
            allowCustomValue={true}
            onCreateOption={this.onSceneTyped}
            isClearable={true}
            formatCreateLabel={(v) => `Scene: ${v}`}
          />
        </div>
      </>
    );
  }
}

const getStyles = stylesFactory((theme: GrafanaTheme) => ({
  dropWrap: css`
    margin-bottom: ${theme.spacing.sm};
    width: 100%;
  `,
}));
