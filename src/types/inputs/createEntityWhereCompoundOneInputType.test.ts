/* eslint-env jest */
import type { EntityConfig } from '../../tsTypes';

import createEntityWhereCompoundOneInputType from './createEntityWhereCompoundOneInputType';

describe('createEntityWhereCompoundOneInputType', () => {
  test('compound index: ["firstName", "code"]', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',

      uniqueCompoundIndexes: [['firstName', 'code']],

      textFields: [
        {
          name: 'firstName',
          type: 'textFields',
        },
        {
          name: 'lastName',
          type: 'textFields',
        },
        {
          name: 'code',
          type: 'textFields',
          unique: true,
        },
      ],
    };
    const expectedResult = [
      'ExampleWhereCompoundOneInput',
      `input ExampleWhereCompoundOneInput {
  firstName: String
  firstName_exists: Boolean
  code: String
  code_exists: Boolean
}`,
      {},
    ];

    const result = createEntityWhereCompoundOneInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('compound index: "none"', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',

      textFields: [
        {
          name: 'firstName',
          type: 'textFields',
        },
        {
          name: 'lastName',
          type: 'textFields',
        },
        {
          name: 'code',
          type: 'textFields',
          unique: true,
        },
      ],
    };
    const expectedResult = ['ExampleWhereCompoundOneInput', '', {}];

    const result = createEntityWhereCompoundOneInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });
});
