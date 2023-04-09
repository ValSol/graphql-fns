/* eslint-env jest */
import type { TangibleEntityConfig } from '../../tsTypes';

import createDeleteEntityWithChildrenOptionsInputType from './createDeleteEntityWithChildrenOptionsInputType';

describe('createDeleteEntityWithChildrenOptionsInputType', () => {
  const personConfig = {} as TangibleEntityConfig;
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
