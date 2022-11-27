// @flow
/* eslint-env jest */
import type { EntityConfig } from '../../flowTypes';

import createDeleteEntityWithChildrenOptionsInputType from './createDeleteEntityWithChildrenOptionsInputType';

describe('createDeleteEntityWithChildrenOptionsInputType', () => {
  const personConfig: EntityConfig = {};
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
    ],
  });

  test('should create input for placeConfig', () => {
    const expectedResult = [
      'deletePlaceWithChildrenOptionsInput',
      `enum deletePlaceWithChildrenOptionsEnum {
  visitors
}
input deletePlaceWithChildrenOptionsInput {
  fieldsToDelete: [deletePlaceWithChildrenOptionsEnum]
}`,
      {},
    ];

    const result = createDeleteEntityWithChildrenOptionsInputType(placeConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create input for personConfig', () => {
    const expectedResult = ['deletePersonWithChildrenOptionsInput', '', {}];

    const result = createDeleteEntityWithChildrenOptionsInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });
});
