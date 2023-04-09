/* eslint-env jest */

import type { TangibleEntityConfig } from '../../tsTypes';

import createEntityWhereOneToCopyInputType from './createEntityWhereOneToCopyInputType';

describe('createEntityWhereOneToCopyInputType', () => {
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
        parent: true,
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
