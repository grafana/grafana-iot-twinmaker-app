import { PanelPlugin } from '@grafana/data';
import { TwinMakerAlarmPanel } from './TwinMakerAlarmPanel';
import { AlarmPanelOptions } from './types';

export const plugin = new PanelPlugin<AlarmPanelOptions>(TwinMakerAlarmPanel);
