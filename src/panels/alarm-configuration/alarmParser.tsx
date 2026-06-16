import { DataFrame, FieldCache, DataQueryRequest } from '@grafana/data';
import { AlarmInfo, AlarmResultFields, AlarmQueryInfo } from './types';
import { TwinMakerQuery } from 'common/manager';

const NO_QUERY = 'No query to parse';
const MISSING_DATE = 'Missing data';
const FRAME_LENGTH_ERROR = 'Frame had no length';
const UNKNOWN_FRAME_TYPE = 'Unknown frame type';

export function processAlarmQueryInput(query: DataQueryRequest<TwinMakerQuery> | undefined): AlarmQueryInfo {
  const info: AlarmQueryInfo = {};

  if (!query) {
    info.invalidFormat = true;
    info.warning = NO_QUERY;
  }

  const target = query?.targets[0];
  info.alarmName = target?.componentName;
  info.entityId = target?.entityId;

  return info;
}

export function processAlarmResult(data: DataFrame[]): AlarmInfo {
  const info: AlarmInfo = {};

  if (!data?.length) {
    info.invalidFormat = true;
    info.warning = MISSING_DATE;
    return info;
  }

  // latest only version
  for (const frame of data) {
    const cache = new FieldCache(frame);
    if (!frame.length) {
      info.invalidFormat = true;
      info.warning = FRAME_LENGTH_ERROR;
      return info; // don't care about structure unless values exist
    }

    if (cache.hasFieldNamed(AlarmResultFields.Status)) {
      const alarmStatusValue = cache.getFieldByName(AlarmResultFields.Status)?.values;
      info.alarmStatus = alarmStatusValue?.get(alarmStatusValue.length - 1);
    } else if (cache.hasFieldNamed(AlarmResultFields.Threshold)) {
      const alarmThresholdValues = cache.getFieldByName(AlarmResultFields.Threshold)?.values;
      info.alarmThreshold = alarmThresholdValues?.get(alarmThresholdValues.length - 1);
    } else if (cache.hasFieldNamed(AlarmResultFields.Recipients)) {
      const notificationValues = cache.getFieldByName(AlarmResultFields.Recipients)?.values;
      info.alarmNotificationRecipient = notificationValues?.get(notificationValues.length - 1);
    } else {
      info.invalidFormat = true;
      info.warning = UNKNOWN_FRAME_TYPE;
      return info;
    }
  }

  return info;
}
