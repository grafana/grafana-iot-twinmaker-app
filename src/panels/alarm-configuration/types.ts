/**
 * The panel options saved in JSON
 */
export interface PanelOptions {
  // When falsy, this should pick the default or first twinmaker datasource instance
  datasource?: string;
}

export interface AlarmInfo {
  invalidFormat?: boolean;
  warning?: string;
  //alarmKey?: string;
  alarmStatus?: string;
  alarmThreshold?: number;
  alarmNotificationRecipient?: string;
}

export interface AlarmQueryInfo {
  invalidFormat?: boolean;
  warning?: string;
  alarmName?: string;
  alarmId?: string;
  entityId?: string;
  entityName?: string;
}

export enum AlarmResultFields {
  Status = 'alarm_status',
  Threshold = 'alarm_threshold',
  Recipients = 'alarm_notification_recipients',
}
