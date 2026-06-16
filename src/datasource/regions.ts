import { SelectableValue } from '@grafana/data';

export const standardRegions = [
  'ap-south-1',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-southeast-1',
  'ap-southeast-2',
  'eu-central-1',
  'eu-west-1',
  'us-east-1',
  'us-west-2',
  'us-gov-west-1',
  'cn-north-1',
];

export const standardRegionOptions: Array<SelectableValue<string>> = standardRegions.map((v) => ({
  value: v,
  label: v,
}));
