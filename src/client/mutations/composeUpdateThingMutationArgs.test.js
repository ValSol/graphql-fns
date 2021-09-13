// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import updateThingMutationAttributes from '../../types/actionAttributes/updateThingMutationAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeUpdateThingMutationArgs', () => {
  test('should compose updateThing mutation args ', () => {
    const prefixName = 'Home';
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = [
      'mutation Home_updateExample($whereOne: ExampleWhereOneInput!, $data: ExampleUpdateInput!) {',
      '  updateExample(whereOne: $whereOne, data: $data) {',
    ];

    const result = composeActionArgs(prefixName, thingConfig, updateThingMutationAttributes, {});
    expect(result).toEqual(expectedResult);
  });

  test('should compose updateThing with reorder mutation args ', () => {
    const prefixName = 'Home';
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

    const expectedResult = [
      'mutation Home_updatePerson($whereOne: PersonWhereOneInput!, $data: PersonUpdateInput!) {',
      '  updatePerson(whereOne: $whereOne, data: $data) {',
    ];

    const result = composeActionArgs(prefixName, personConfig, updateThingMutationAttributes, {});
    expect(result).toEqual(expectedResult);
  });
});
