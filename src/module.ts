import { ExampleConfigCtrl } from './legacy/config';
import { AppPlugin } from '@grafana/data';
import { registerXFormer } from 'transformer/RegisterTwinMakerLinksEditor';
import { App } from './components/App';

export { ExampleConfigCtrl as ConfigCtrl };

export const plugin = new AppPlugin().setRootPage(App);

registerXFormer();
