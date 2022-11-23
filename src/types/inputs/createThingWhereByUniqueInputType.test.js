// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import createThingWhereByUniqueInputType from './createThingWhereByUniqueInputType';

describe('createThingWhereByUniqueInputType', () => {
  test('should create empty string if there are not any index fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
        },
        {
          name: 'lastName',
        },
        {
          name: 'code',
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

    const result = createThingWhereByUniqueInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type if there are text index fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          index: true,
        },
        {
          name: 'lastName',
          index: true,
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

    const result = createThingWhereByUniqueInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
