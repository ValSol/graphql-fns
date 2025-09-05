/* eslint-env jest */
import type { TangibleEntityConfig } from '@/tsTypes';

import createEntityWhichUpdatedInputType from './createEntityWhichUpdatedInputType';

describe('createEntityWhichUpdatedInputType', () => {
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
      'PlaceWhichUpdatedInput',
      `enum PlaceWhichUpdatedEnum {
  name
  citizens
  visitors
}
input PlaceWhichUpdatedInput {
  updatedFields: PlaceWhichUpdatedEnum
  updatedFields_ne: PlaceWhichUpdatedEnum
  updatedFields_in: [PlaceWhichUpdatedEnum!]
  updatedFields_nin: [PlaceWhichUpdatedEnum!]
}`,
      {},
    ];

    const result = createEntityWhichUpdatedInputType(placeConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create input for personConfig', () => {
    const expectedResult = [
      'PersonWhichUpdatedInput',
      `enum PersonWhichUpdatedEnum {
  firstName
  lastName
  friends
  enemies
  location
  favoritePlace
}
input PersonWhichUpdatedInput {
  updatedFields: PersonWhichUpdatedEnum
  updatedFields_ne: PersonWhichUpdatedEnum
  updatedFields_in: [PersonWhichUpdatedEnum!]
  updatedFields_nin: [PersonWhichUpdatedEnum!]
}`,
      {},
    ];

    const result = createEntityWhichUpdatedInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });
});
