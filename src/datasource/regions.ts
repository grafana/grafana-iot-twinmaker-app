import { SelectableValue } from '@grafana/data';

export const standardRegions = ['ap-southeast-1', 'ap-southeast-2', 'eu-central-1', 'eu-west-1', 'us-east-1', 'us-west-2'];

export const standardRegionOptions: Array<SelectableValue<string>> = standardRegions.map((v) => ({
  value: v,
  label: v,
}));
