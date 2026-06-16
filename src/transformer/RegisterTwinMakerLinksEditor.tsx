import React, { useMemo } from 'react';
import {
  FieldType,
  GrafanaTheme2,
  SelectableValue,
  standardTransformersRegistry,
  TransformerRegistryItem,
  TransformerUIProps,
} from '@grafana/data';
import {
  registerTwinMakerLinksTransformer,
  RegisterTwinMakerLinksOptions,
  TwinMakerVarInfo,
} from './registerTwinMakerLinks';
import { css } from '@emotion/css';
import { InlineFieldRow, InlineField, Select, useStyles2, Input, Button, InlineSwitch } from '@grafana/ui';
import { getTwinMakerDatasourcePicker } from 'common/datasourceSrv';
import { getSelectionInfo } from 'common/info/info';
import { getVariableOptions } from 'common/variables';

const labelWidth = 16;

export const RegisterTwinMakerLinksEditor: React.FC<TransformerUIProps<RegisterTwinMakerLinksOptions>> = ({
  options,
  onChange,
  input,
}) => {
  const styles = useStyles2(getStyles);

  const fieldNames = useMemo(() => {
    const names = new Set<string>();
    const opts: Array<SelectableValue<string>> = [];
    for (const frame of input) {
      for (const field of frame.fields) {
        if (field.type === FieldType.string && !names.has(field.name)) {
          opts.push({
            label: field.name,
            value: field.name,
          });
          names.add(field.name);
        }
      }
    }
    return opts;
  }, [input]);

  const variables = getVariableOptions({ hideValue: true });
  const instances = getTwinMakerDatasourcePicker();
  if (!instances.length) {
    return <div className={styles.wrap}>No TwinMaker datasources configured.</div>;
  }
  if (!variables.length) {
    return <div className={styles.wrap}>No template variables configured</div>;
  }

  const onVarChange = (idx: number, v?: TwinMakerVarInfo) => {
    const vars = options.vars ? options.vars.slice() : [{} as any];
    if (!v) {
      vars.splice(idx, 1);
    } else {
      vars[idx] = v;
    }
    onChange({
      ...options,
      vars,
    });
  };

  const onAddVar = () => {
    const vars = options.vars ? options.vars.slice() : [{} as any];
    vars.push({} as any);
    onChange({
      ...options,
      vars,
    });
  };

  const vars = options.vars?.length ? options.vars : [{} as TwinMakerVarInfo];

  const dsInfo = getSelectionInfo(options.ds, instances);
  return (
    <div className={'gf-form-group'} style={{ width: '100%' }}>
      <InlineFieldRow>
        <InlineField label="Workspace" labelWidth={labelWidth} grow>
          <Select
            menuShouldPortal
            options={dsInfo.options}
            value={dsInfo.current ?? dsInfo.options[0]}
            onChange={(v) => onChange({ ...options, ds: v.value })}
          />
        </InlineField>
      </InlineFieldRow>
      {/* <InlineFieldRow>
        <InlineField label="Fields" labelWidth={12} grow>
          <div>ALL FIELDS</div>
        </InlineField>
      </InlineFieldRow> */}
      <InlineFieldRow>
        <InlineField label="Title" labelWidth={labelWidth} grow>
          <Input
            value={options.title}
            placeholder="TwinMaker link"
            onChange={(v) => onChange({ ...options, title: v.currentTarget.value })}
          />
        </InlineField>
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineField label="Show selection" labelWidth={labelWidth} grow>
          <InlineSwitch
            value={options.addSelectionField}
            onChange={(e) => {
              onChange({ ...options, addSelectionField: e.currentTarget.checked });
            }}
          />
        </InlineField>
      </InlineFieldRow>

      {vars.map((v, idx) => {
        return (
          <SetVarEditor
            key={`${v.name}/${idx}/${v.fieldName}`}
            value={v}
            index={idx}
            onChange={onVarChange}
            variables={variables}
            fieldNames={fieldNames}
          />
        );
      })}
      <div>
        <Button onClick={onAddVar} icon="plus" variant="secondary">
          Add variable
        </Button>
      </div>
    </div>
  );
};

interface VarEditorProps {
  index: number;
  value: TwinMakerVarInfo;
  onChange: (index: number, v?: TwinMakerVarInfo) => void;
  variables: Array<SelectableValue<string>>;
  fieldNames: Array<SelectableValue<string>>;
}

function SetVarEditor(props: VarEditorProps): React.ReactElement {
  const { index, value, variables, fieldNames, onChange } = props;
  const varOpts = getSelectionInfo(value.name, variables);
  const fieldOpts = getSelectionInfo(value.fieldName, fieldNames);
  return (
    <InlineFieldRow>
      <InlineField label="Set" labelWidth={labelWidth}>
        <Select
          menuShouldPortal
          value={varOpts.current}
          options={varOpts.options}
          onChange={(v) => onChange(index, { ...value, name: v.value! })}
          width={20}
        />
      </InlineField>
      <InlineField label="=" grow>
        <InlineField label="Field" grow>
          <Select
            menuShouldPortal
            value={fieldOpts.current}
            options={fieldOpts.options}
            onChange={(v) => onChange(index, { ...value, fieldName: v.value! })}
          />
        </InlineField>
      </InlineField>
      <Button onClick={() => props.onChange(index)} icon="trash-alt" variant="secondary" />
    </InlineFieldRow>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  wrap: css`
    border: 1px solid red;
  `,
  info: css`
    margin-left: 20px;
  `,
});

export const twinMakerLinksTransformerRegistryItem: TransformerRegistryItem<RegisterTwinMakerLinksOptions> = {
  id: registerTwinMakerLinksTransformer.id,
  editor: RegisterTwinMakerLinksEditor,
  transformation: registerTwinMakerLinksTransformer,
  name: registerTwinMakerLinksTransformer.name,
  description: registerTwinMakerLinksTransformer.description,
  help: `
  Define selection behavior on the dashboard from the results of an IoT TwinMaker query.
  Supported for the Table panel visualization.

  1. Select the datasource that is used by the query to transform
  2. Enter the title of the link transformation (i.e. Alarm Selection)
  3. Toggle whether the selection is visible on the table in a separate column
  4. Define selection behavior by assigning the value of a field to a template variable
  `,
};

// Register the transformer
export function registerXFormer() {
  if (!standardTransformersRegistry.getIfExists(registerTwinMakerLinksTransformer.id)) {
    standardTransformersRegistry.register(twinMakerLinksTransformerRegistryItem);
  }
}
