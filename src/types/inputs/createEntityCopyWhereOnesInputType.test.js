// @flow
/* eslint-env jest */

import type { EntityConfig } from '../../flowTypes';

import createEntityCopyWhereOnesInputType from './createEntityCopyWhereOnesInputType';
import createEntityWhereOneInputType from './createEntityWhereOneInputType';

describe('createEntityCopyWhereOnesInputType', () => {
  const personConfig: EntityConfig = {};

  const personCloneConfig: EntityConfig = {};

  const placeConfig: EntityConfig = {
    name: 'Place',
    type: 'tangible',

    textFields: [{ name: 'name' }],

    duplexFields: [
      {
        name: 'citizens',
        oppositeName: 'location',
        array: true,
        config: personConfig,
      },

      {
        name: 'visitors',
        oppositeName: 'favoritePlace',
        array: true,
        config: personConfig,
        required: true,
      },
    ],
  };

  Object.assign(personConfig, {
    name: 'Person',
    type: 'tangible',

    textFields: [
      {
        name: 'firstName',
        required: true,
      },

      {
        name: 'lastName',
        required: true,
      },
    ],

    duplexFields: [
      {
        name: 'friends',
        oppositeName: 'friends',
        config: personConfig,
        array: true,
        required: true,
      },

      {
        name: 'enemies',
        oppositeName: 'enemies',
        array: true,
        config: personConfig,
      },

      {
        name: 'location',
        oppositeName: 'citizens',
        config: placeConfig,
        required: true,
      },

      {
        name: 'favoritePlace',
        oppositeName: 'visitors',
        config: placeConfig,
      },

      {
        name: 'clone',
        oppositeName: 'original',
        config: personCloneConfig,
      },
    ],
  });

  Object.assign(personCloneConfig, {
    name: 'PersonClone',
    type: 'tangible',

    textFields: [
      {
        name: 'firstName',
        required: true,
      },

      {
        name: 'lastName',
        required: true,
      },
    ],

    duplexFields: [
      {
        name: 'original',
        oppositeName: 'clone',
        config: personConfig,
        required: true,
      },
    ],
  });

  test('should create entity input type', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
    };
    const expectedResult = ['ExampleCopyWhereOnesInput', '', {}];

    const result = createEntityCopyWhereOnesInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity input type', () => {
    const entityConfig: EntityConfig = {};
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',

      textFields: [{ name: 'title' }],

      duplexFields: [
        {
          name: 'original',
          oppositeName: 'backup',
          config: entityConfig,
        },

        {
          name: 'backup',
          oppositeName: 'original',
          config: entityConfig,
        },
      ],
    });

    const expectedResult = [
      'ExampleCopyWhereOnesInput',
      `input ExampleCopyWhereOnesInput {
  original: ExampleWhereOneInput
  backup: ExampleWhereOneInput
}`,
      {
        ExampleWhereOneInput: [createEntityWhereOneInputType, entityConfig],
      },
    ];

    const result = createEntityCopyWhereOnesInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity update input type with duplex fields', () => {
    const expectedResult = [
      'PersonCopyWhereOnesInput',
      `input PersonCopyWhereOnesInput {
  friends: PersonWhereOneInput
  enemies: PersonWhereOneInput
  clone: PersonCloneWhereOneInput
}`,
      {
        PersonWhereOneInput: [createEntityWhereOneInputType, personConfig],
        PersonCloneWhereOneInput: [createEntityWhereOneInputType, personCloneConfig],
      },
    ];

    const result = createEntityCopyWhereOnesInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity update input type with duplex fields', () => {
    const expectedResult = ['PlaceCopyWhereOnesInput', '', {}];

    const result = createEntityCopyWhereOnesInputType(placeConfig);
    expect(result).toEqual(expectedResult);
  });
});
