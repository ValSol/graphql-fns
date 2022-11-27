// @flow
/* eslint-env jest */

import type { EntityConfig } from '../../flowTypes';

import createEntityWhereOneToCopyInputType from './createEntityWhereOneToCopyInputType';

describe('createEntityWhereOneToCopyInputType', () => {
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

  test('should create Person input type', () => {
    const expectedResult = [
      'PersonWhereOneToCopyInput',
      `input PersonWhereOneToCopyInput {
  id: ID!
}`,
      {},
    ];

    const result = createEntityWhereOneToCopyInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create Person input type', () => {
    const expectedResult = ['PersonCloneWhereOneToCopyInput', '', {}];

    const result = createEntityWhereOneToCopyInputType(personCloneConfig);
    expect(result).toEqual(expectedResult);
  });
});
