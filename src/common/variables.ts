import { getTemplateSrv } from '@grafana/runtime';
import { SelectableValue } from '@grafana/data';

interface VariableOptions {
  hideValue?: boolean;
}

export function getVariableOptions(opts?: VariableOptions) {
  const templateSrv = getTemplateSrv();
  return templateSrv.getVariables().map((t) => {
    const value = '${' + t.name + '}';
    const info: SelectableValue<string> = {
      label: opts?.hideValue ? `${value}` : `${value} = ${templateSrv.replace(value)}`,
      value,
      icon: 'arrow-right', // not sure what makes the most sense
    };
    return info;
  });
}
