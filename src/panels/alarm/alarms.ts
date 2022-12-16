import { DataFrame, DataFrameView, FieldCache } from '@grafana/data';

export interface AlarmState {
  Time?: number;
  name: string;
  alarmStatus: string;
  alarmId: string;
  entityId: string;
  entityName: string;
}

export interface AlarmInfo {
  invalidFormat?: boolean;
  warning?: string;
  status: Record<string, number>;
  alarms: AlarmState[];
}

export function processAlarmResult(data: DataFrame[]): AlarmInfo {
  const info: AlarmInfo = { status: {}, alarms: [] };
  if (!data?.length) {
    info.invalidFormat = true;
    info.warning = 'missing data';
    return info;
  }
  if (data.length !== 1) {
    info.invalidFormat = true;
    info.warning = 'only expecting one frame';
    return info;
  }
  const frame = data[0];
  const cache = new FieldCache(frame);
  for (const f of ['Time', 'name', 'alarmStatus']) {
    if (!cache.hasFieldNamed(f)) {
      info.invalidFormat = true;
      info.warning = `missing field: ${f}`;
      return info;
    }
  }

  if (!frame.length) {
    return info; // don't care about structure unless values exist
  }

  const view = new DataFrameView<AlarmState>(frame);
  info.alarms = view.map((v) => {
    let count = info.status[v.alarmStatus];
    if (count == null) {
      count = 0;
    }
    info.status[v.alarmStatus] = count + 1;
    return { ...v };
  });

  return info;
}
