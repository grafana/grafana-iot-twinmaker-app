import { AppPlugin } from '@grafana/data';
import { registerXFormer } from 'transformer/RegisterTwinMakerLinksEditor';

export const plugin = new AppPlugin();

registerXFormer();
