/* eslint-env jest */
import type { EntityConfig } from '../../tsTypes';

import createEntityWhereByUniqueInputType from './createEntityWhereByUniqueInputType';

describe('createEntityWhereByUniqueInputType', () => {
  test('should create empty string if there are not any index fields', () => {
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
    const expectedResult = [
      'ExampleWhereByUniqueInput',
      `input ExampleWhereByUniqueInput {
  id_in: [ID!]
  code_in: [String!]
}`,
      {},
    ];

    const result = createEntityWhereByUniqueInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity input type if there are text index fields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          index: true,
          type: 'textFields',
        },
        {
          name: 'lastName',
          index: true,
          type: 'textFields',
        },
      ],
    };
    const expectedResult = [
      'ExampleWhereByUniqueInput',
      `input ExampleWhereByUniqueInput {
  id_in: [ID!]
}`,
      {},
    ];

    const result = createEntityWhereByUniqueInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });
});
