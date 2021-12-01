import React, { PureComponent } from 'react';
import { css } from '@emotion/css';
import { Button, stylesFactory } from '@grafana/ui';
import { StandardEditorProps, GrafanaTheme } from '@grafana/data';

import { config } from '@grafana/runtime';
import { LayoutPanelOptions, LayoutRule } from '../types';
import { TwinMakerDataSource } from 'datasource/datasource';
import { getTwinMakerDatasource } from 'common/datasourceSrv';
import { SelectableComponents } from 'common/info/types';
import { LayoutRuleEditor } from './LayoutRuleEditor';

type Props = StandardEditorProps<LayoutRule[], unknown, LayoutPanelOptions>;

interface State {
  datasource?: TwinMakerDataSource;
  components?: SelectableComponents;
}

export class LayoutRulesEditor extends PureComponent<Props, State> {
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
    if (options?.datasource !== prev?.datasource) {
      this.initTwinMakerDatasource();
    }
  }

  // Called when datasource changes (not often!)
  initTwinMakerDatasource = async () => {
    const options = this.props.context?.options;
    const ds = await getTwinMakerDatasource(options?.datasource);
    if (ds && ds.getWorkspaceId()) {
      try {
        const info = await ds.info.getWorkspaceInfo();
        this.setState({
          datasource: ds,
          components: info.components,
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

  onRuleChanged = (index: number, rule?: LayoutRule) => {
    const { onChange, value } = this.props;
    if (rule) {
      const copy = value.slice();
      copy[index] = rule;
      onChange(copy);
    } else {
      value.splice(index, 1);
      onChange(value);
    }
  };

  onAddRule = () => {
    const copy = this.props.value.slice();
    copy.push({} as LayoutRule);
    this.props.onChange(copy);
  };

  render() {
    const style = getStyles(config.theme);

    let rules = this.props.value;
    if (!rules?.length) {
      rules = [];
    }

    return (
      <>
        <div className={style.dropWrap}>
          <br />

          {rules.map((f, idx) => {
            return (
              <LayoutRuleEditor
                key={`${f}/${idx}`}
                value={f}
                index={idx}
                onChange={this.onRuleChanged}
                components={this.state.components}
              />
            );
          })}

          <Button icon="plus" variant="secondary" size="md" onClick={this.onAddRule}>
            Add rule
          </Button>
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
