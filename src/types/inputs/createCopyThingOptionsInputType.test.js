// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import createCopyThingOptionsInputType from './createCopyThingOptionsInputType';

describe('createCopyThingOptionsInputType', () => {
  const personConfig: ThingConfig = {};
  const personCloneConfig: ThingConfig = {};
  const placeConfig: ThingConfig = {
    name: 'Place',
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
      },
    ],
  };

  Object.assign(personConfig, {
    name: 'Person',
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
        parent: true,
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

  test('should create input for personConfig', () => {
    const expectedResult = [
      'copyPersonOptionsInput',
      `enum copyPersonThroughfriendsOptionsEnum {
  firstName
  lastName
  enemies
  location
  favoritePlace
  clone
}
enum copyPersonThroughenemiesOptionsEnum {
  firstName
  lastName
  friends
  location
  favoritePlace
  clone
}
enum copyPersonThroughcloneOptionsEnum {
  firstName
  lastName
}
input copyPersonThroughfriendsOptionInput {
  fieldsToCopy: [copyPersonThroughfriendsOptionsEnum!]!
}
input copyPersonThroughenemiesOptionInput {
  fieldsToCopy: [copyPersonThroughenemiesOptionsEnum!]!
}
input copyPersonThroughcloneOptionInput {
  fieldsToCopy: [copyPersonThroughcloneOptionsEnum!]!
}
input copyPersonOptionsInput {
  friends: copyPersonThroughfriendsOptionInput
  enemies: copyPersonThroughenemiesOptionInput
  clone: copyPersonThroughcloneOptionInput
}`,
      {},
    ];

    const result = createCopyThingOptionsInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create input for personConfig', () => {
    const expectedResult = ['copyPlaceOptionsInput', '', {}];

    const result = createCopyThingOptionsInputType(placeConfig);
    expect(result).toEqual(expectedResult);
  });
});
