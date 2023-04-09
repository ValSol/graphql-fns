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
          type: 'duplexFields',
        },
      ],
      relationalFields: [
        {
          name: 'copy',
          config: entityConfig,
          unique: true,
          type: 'relationalFields',
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
          type: 'textFields',
        },
        {
          name: 'userId',
          unique: true,
          type: 'textFields',
        },
        {
          name: 'firstName',
          type: 'textFields',
        },
      ],
      intFields: [
        {
          name: 'perosonaNum',
          unique: true,
          type: 'intFields',
        },
      ],
      floatFields: [
        {
          name: 'perosonaNumber',
          unique: true,
          type: 'floatFields',
        },
      ],
      dateTimeFields: [
        {
          name: 'birthday',
          unique: true,
          type: 'dateTimeFields',
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
