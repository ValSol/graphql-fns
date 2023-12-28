import type { TangibleEntityConfig } from '../tsTypes';

import composeCompoundIndexes from './composeCompoundIndexes';

describe('composeCompoundIndexes', () => {
  test('should compose indexes with text fields', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField1',
          index: true,
          type: 'textFields',
        },
        {
          name: 'textField2',
          default: 'default text',
          type: 'textFields',
        },
        {
          name: 'textField3',
          required: true,
          unique: true,
          type: 'textFields',
        },
      ],

      uniqueCompoundIndexes: [
        ['textField1', 'textField2'],
        ['textField1', 'textField3'],
      ],
    };
    const expectedResult = [
      { textField1: 1, textField2: 1 },
      { textField1: 1, textField3: 1 },
    ];

    const result = composeCompoundIndexes(entityConfig);
    expect(result).toEqual(expectedResult);
  });
});
