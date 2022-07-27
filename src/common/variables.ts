import { getTemplateSrv } from '@grafana/runtime';
import { SelectableValue } from '@grafana/data';

interface VariableOptions {
  hideValue?: boolean;
  keepVarSyntax?: boolean;
}

export function getVariableOptions(opts?: VariableOptions) {
  const templateSrv = getTemplateSrv();
  return templateSrv.getVariables().map((t) => {
    const label = '${' + t.name + '}';
    const info: SelectableValue<string> = {
      label: opts?.hideValue ? `${label}` : `${label} = ${templateSrv.replace(label)}`,
      value: opts?.keepVarSyntax ? label : t.name,
      icon: 'arrow-right', // not sure what makes the most sense
    };
    return info;
  });
}

// Use template variable syntax surrounding a variable name with "${}"
export function tempVarSyntax(name: string) {
  return !name || name.indexOf('$') >= 0 ? name : `\$\{${name}\}`;
}

const templateVarRegExp = /^\$\{([\s\S]+)\}$/;

// Remove "${}" from a template variable name
export function undecorateName(name: string) {
  return name.match(templateVarRegExp)?.[1] ?? name;
}

// Get the template variable name as stored in the URL - "var-variableName", adding the "var-"
export const getUrlTempVarName = (name: string) => {
  const varName = (s: string) => (s.length > 0 ? `var-${s}` : '');
  const undecoratedName = undecorateName(name);
  return varName(undecoratedName);
};
