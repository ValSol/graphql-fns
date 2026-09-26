/* eslint-env jest */

import type { TangibleEntityConfig } from '../../tsTypes';

import createEntityWhereKeyToSourceInputType from './createEntityWhereKeyToSourceInputType';
import createEntityWhereOneInputType from './createEntityWhereOneInputType';

describe('createEntityWhereKeyToSourceInputType', () => {
  const personConfig = {} as TangibleEntityConfig;

  const personCloneConfig = {} as TangibleEntityConfig;

  const placeConfig: TangibleEntityConfig = {
    name: 'Place',
    type: 'tangible',

    textFields: [{ name: 'name', type: 'textFields' }],

    duplexFields: [
      {
        name: 'citizens',
        oppositeName: 'location',
        array: true,
        config: personConfig,
        type: 'duplexFields',
      },

      {
        name: 'visitors',
        oppositeName: 'favoritePlace',
        array: true,
        config: personConfig,
        required: true,
        type: 'duplexFields',
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
        type: 'textFields',
      },

      {
        name: 'lastName',
        required: true,
        type: 'textFields',
      },
    ],

    duplexFields: [
      {
        name: 'friends',
        oppositeName: 'friends',
        config: personConfig,
        array: true,
        required: true,
        type: 'duplexFields',
      },

      {
        name: 'enemies',
        oppositeName: 'enemies',
        array: true,
        config: personConfig,
        type: 'duplexFields',
      },

      {
        name: 'location',
        oppositeName: 'citizens',
        config: placeConfig,
        required: true,
        type: 'duplexFields',
      },

      {
        name: 'favoritePlace',
        oppositeName: 'visitors',
        config: placeConfig,
        type: 'duplexFields',
      },

      {
        name: 'clone',
        oppositeName: 'original',
        config: personCloneConfig,
        type: 'duplexFields',
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
        type: 'textFields',
      },

      {
        name: 'lastName',
        required: true,
        type: 'textFields',
      },
    ],

    duplexFields: [
      {
        name: 'original',
        oppositeName: 'clone',
        config: personConfig,
        required: true,
        type: 'duplexFields',
      },
    ],
  });

  test('should create entity input type', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
    };
    const expectedResult = ['ExampleWhereKeyToSourceInput', '', {}];

    const result = createEntityWhereKeyToSourceInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity input type', () => {
    const entityConfig = {} as TangibleEntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',

      textFields: [{ name: 'title', type: 'textFields' }],

      duplexFields: [
        {
          name: 'original',
          oppositeName: 'backup',
          config: entityConfig,
          type: 'duplexFields',
        },

        {
          name: 'backup',
          oppositeName: 'original',
          config: entityConfig,
          type: 'duplexFields',
        },
      ],
    });

    const expectedResult = [
      'ExampleWhereKeyToSourceInput',
      `input ExampleWhereKeyToSourceInput {
  original: ExampleWhereOneInput
  backup: ExampleWhereOneInput
}`,
      {
        ExampleWhereOneInput: [createEntityWhereOneInputType, entityConfig],
      },
    ];

    const result = createEntityWhereKeyToSourceInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity update input type with duplex fields', () => {
    const expectedResult = [
      'PersonWhereKeyToSourceInput',
      `input PersonWhereKeyToSourceInput {
  friends: PersonWhereOneInput
  enemies: PersonWhereOneInput
  clone: PersonCloneWhereOneInput
}`,
      {
        PersonWhereOneInput: [createEntityWhereOneInputType, personConfig],
        PersonCloneWhereOneInput: [createEntityWhereOneInputType, personCloneConfig],
      },
    ];

    const result = createEntityWhereKeyToSourceInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity update input type with duplex fields', () => {
    const expectedResult = ['PlaceWhereKeyToSourceInput', '', {}];

    const result = createEntityWhereKeyToSourceInputType(placeConfig);
    expect(result).toEqual(expectedResult);
  });
});
