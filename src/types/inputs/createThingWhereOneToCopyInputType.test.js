// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import createThingWhereOneToCopyInputType from './createThingWhereOneToCopyInputType';

describe('createThingWhereOneToCopyInputType', () => {
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

  test('should create Person input type', () => {
    const expectedResult = [
      'PersonWhereOneToCopyInput',
      `input PersonWhereOneToCopyInput {
  id: ID!
}`,
      {},
    ];

    const result = createThingWhereOneToCopyInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create Person input type', () => {
    const expectedResult = ['PersonCloneWhereOneToCopyInput', '', {}];

    const result = createThingWhereOneToCopyInputType(personCloneConfig);
    expect(result).toEqual(expectedResult);
  });
});
