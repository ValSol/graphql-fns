/* eslint-env jest */

import type { EntityConfig } from '../../tsTypes';

import createEntityWhereOneInputType from './createEntityWhereOneInputType';

describe('createEntityWhereOneInputType', () => {
  test('should create entity input type', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
    };
    const expectedResult = [
      'ExampleWhereOneInput',
      `input ExampleWhereOneInput {
  id: ID!
}`,
      {},
    ];

    const result = createEntityWhereOneInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });
  test('should create entity input type', () => {
    const entityConfig = {} as EntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      duplexFields: [
        {
          name: 'original',
          oppositeName: 'backup',
          config: entityConfig,
          required: true,
          unique: true,
        },
      ],
      relationalFields: [
        {
          name: 'copy',
          config: entityConfig,
          unique: true,
        },
      ],
    });
    const expectedResult = [
      'ExampleWhereOneInput',
      `input ExampleWhereOneInput {
  id: ID
  original: ID
  copy: ID
}`,
      {},
    ];

    const result = createEntityWhereOneInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });
  test('should create entity input type with several args', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'email',
          unique: true,
        },
        {
          name: 'userId',
          unique: true,
        },
        {
          name: 'firstName',
        },
      ],
      intFields: [
        {
          name: 'perosonaNum',
          unique: true,
        },
      ],
      floatFields: [
        {
          name: 'perosonaNumber',
          unique: true,
        },
      ],
      dateTimeFields: [
        {
          name: 'birthday',
          unique: true,
        },
      ],
    };
    const expectedResult = [
      'ExampleWhereOneInput',
      `input ExampleWhereOneInput {
  id: ID
  email: ID
  userId: ID
  perosonaNum: Int
  perosonaNumber: Float
  birthday: DateTime
}`,
      {},
    ];

    const result = createEntityWhereOneInputType(entityConfig);

    expect(result).toEqual(expectedResult);
  });
});
