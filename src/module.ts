import { ExampleConfigCtrl } from './legacy/config';
import { AppPlugin } from '@grafana/data';
import { registerXFormer } from 'transformer/RegisterTwinMakerLinksEditor';

export { ExampleConfigCtrl as ConfigCtrl };

export const plugin = new AppPlugin();

registerXFormer();
