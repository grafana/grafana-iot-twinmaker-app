import { toDataFrame } from '@grafana/data';
import { processAlarmResult } from './alarms';

describe('alarm helper', () => {
  it('should identify bad frame structures', () => {
    const frame = toDataFrame({
      fields: [{ name: 'name', values: ['a', 'b', 'c'] }],
    });

    let result = processAlarmResult([]);
    expect(result.warning).toMatchInlineSnapshot(`"missing data"`);

    result = processAlarmResult([frame]);
    expect(result.warning).toMatchInlineSnapshot(`"missing field: Time"`);
  });

  it('should identify bad frame structures', () => {
    const frame = toDataFrame({
      fields: [
        { name: 'Time', values: [1, 2, 3] },
        { name: 'name', values: ['a', 'b', 'c'] },
        { name: 'status', values: ['ok', 'ok', 'bad'] },
        { name: 'alarmId', values: ['a1', 'a2', 'a3'] },
        { name: 'entityId', values: ['e1', 'e2', 'e3'] },
      ],
    });

    const result = processAlarmResult([frame]);
    expect(result).toMatchInlineSnapshot(`
      {
        "alarms": [],
        "invalidFormat": true,
        "status": {},
        "warning": "missing field: alarmStatus",
      }
    `);
  });
});
