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

});
