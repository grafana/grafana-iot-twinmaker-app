import { getQueryUpdate } from './merge';
import { VariableAction } from './types';

describe('Layout manager', () => {
  it('should extract actions into query parameters', () => {
    const actions: VariableAction[] = [
      { variable: 'aaa', value: 'AAA' },
      { variable: '${xyz}', value: 'XYZ' },
      {} as VariableAction,
      { variable: '' },
      { variable: undefined } as unknown as VariableAction,
      { variable: '${remove}' },
      { variable: '}invalid${', value: 'X' },
    ];
    const update = getQueryUpdate(actions, (v) => v);
    expect(update).toMatchInlineSnapshot(`
      Object {
        "var-aaa": "AAA",
        "var-remove": undefined,
        "var-xyz": "XYZ",
        "var-}invalid\${": "X",
      }
    `);
  });
});
