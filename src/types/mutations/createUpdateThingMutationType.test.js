// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import createUpdateThingMutationType from './createUpdateThingMutationType';

describe('createUpdateThingMutationType', () => {
  test('should create mutation update thing type', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };
    const expectedResult =
      '  updateExample(whereOne: ExampleWhereOneInput!, data: ExampleUpdateInput!): Example!';

    const result = createUpdateThingMutationType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create mutation update thing type with ReorderCreatedInputType', () => {
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
      '  updatePerson(whereOne: PersonWhereOneInput!, data: PersonUpdateInput!, positions: PersonReorderCreatedInput): Person!';

    const result = createUpdateThingMutationType(personConfig);
    expect(result).toEqual(expectedResult);
  });
});
