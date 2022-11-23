// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import createThingCopyWhereOnesInputType from './createThingCopyWhereOnesInputType';
import createThingWhereOneInputType from './createThingWhereOneInputType';

describe('createThingCopyWhereOnesInputType', () => {
  const personConfig: ThingConfig = {};

  const personCloneConfig: ThingConfig = {};

  const placeConfig: ThingConfig = {
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

  test('should create thing input type', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      type: 'tangible',
    };
    const expectedResult = ['ExampleCopyWhereOnesInput', '', {}];

    const result = createThingCopyWhereOnesInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      type: 'tangible',

      textFields: [{ name: 'title' }],

      duplexFields: [
        {
          name: 'original',
          oppositeName: 'backup',
          config: thingConfig,
        },

        {
          name: 'backup',
          oppositeName: 'original',
          config: thingConfig,
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
        ExampleWhereOneInput: [createThingWhereOneInputType, thingConfig],
      },
    ];

    const result = createThingCopyWhereOnesInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing update input type with duplex fields', () => {
    const expectedResult = [
      'PersonCopyWhereOnesInput',
      `input PersonCopyWhereOnesInput {
  friends: PersonWhereOneInput
  enemies: PersonWhereOneInput
  clone: PersonCloneWhereOneInput
}`,
      {
        PersonWhereOneInput: [createThingWhereOneInputType, personConfig],
        PersonCloneWhereOneInput: [createThingWhereOneInputType, personCloneConfig],
      },
    ];

    const result = createThingCopyWhereOnesInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing update input type with duplex fields', () => {
    const expectedResult = ['PlaceCopyWhereOnesInput', '', {}];

    const result = createThingCopyWhereOnesInputType(placeConfig);
    expect(result).toEqual(expectedResult);
  });
});
