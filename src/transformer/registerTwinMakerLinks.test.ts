import { toDataFrame, FieldType } from '@grafana/data';
import { TwinMakerWorkspaceInfoSupplier } from 'common/info/types';
import { RegisterTwinMakerLinksOptions, applyTwinMakerLinks } from './registerTwinMakerLinks';

describe('register twinmaker links transformer', () => {
  it('should attach click events', () => {
    const source = [
      toDataFrame({
        name: 'wide',
        refId: 'A',
        fields: [
          { name: 'time', type: FieldType.time, values: [1, 2, 3, 4, 5, 6] },
          { name: 'count', type: FieldType.number, values: [10, 20, 30, 40, 50, 60] },
          { name: 'more', type: FieldType.number, values: [2, 3, 4, 5, 6, 7] },
        ],
      }),
    ];

    const config: RegisterTwinMakerLinksOptions = {
      title: 'Some title',
      vars: [
        { name: 'v0', fieldName: 'VALUE0' },
        { name: 'v1', fieldName: 'VALUE1' },
      ],
    };

    const info = {} as TwinMakerWorkspaceInfoSupplier;
    const after = applyTwinMakerLinks(info, config, source[0]);
    expect(after.fields.map((f) => f.config.links)).toMatchInlineSnapshot(`
      [
        [
          {
            "onClick": [Function],
            "title": "Some title",
            "url": "",
          },
        ],
        [
          {
            "onClick": [Function],
            "title": "Some title",
            "url": "",
          },
        ],
        [
          {
            "onClick": [Function],
            "title": "Some title",
            "url": "",
          },
        ],
      ]
    `);
  });
});
