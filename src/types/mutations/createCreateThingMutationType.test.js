// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import createCreateThingMutationType from './createCreateThingMutationType';

describe('createCreateThingMutationType', () => {
  test('should create mutation add thing type', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
    };
    const expectedResult = '  createExample(data: ExampleCreateInput!): Example!';

    const result = createCreateThingMutationType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create mutation add thing type', () => {
    const placeConfig: ThingConfig = {
      name: 'Place',
      textFields: [{ name: 'name' }],
    };
    const personConfig: ThingConfig = {};
    Object.assign(personConfig, {
      name: 'Person',
      relationalFields: [
        {
          name: 'friends',
          config: personConfig,
          array: true,
          required: true,
        },
        {
          name: 'enemies',
          config: personConfig,
          array: true,
        },
        {
          name: 'location',
          config: placeConfig,
          required: true,
        },
        {
          name: 'favoritePlace',
          config: placeConfig,
        },
      ],
    });
    const expectedResult =
      '  createPerson(data: PersonCreateInput!, positions: PersonReorderCreatedInput): Person!';

    const result = createCreateThingMutationType(personConfig);
    expect(result).toEqual(expectedResult);
  });
});
