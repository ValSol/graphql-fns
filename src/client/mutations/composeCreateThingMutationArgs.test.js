// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import createThingMutationAttributes from '../../types/actionAttributes/createThingMutationAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeCreateThingMutationArgs', () => {
  test('should compose createThing mutation args ', () => {
    const prefixName = 'Home';
    const thingConfig: ThingConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = [
      'mutation Home_createExample($data: ExampleCreateInput!) {',
      '  createExample(data: $data) {',
    ];

    const result = composeActionArgs(prefixName, thingConfig, createThingMutationAttributes, {});
    expect(result).toEqual(expectedResult);
  });

  test('should compose createThing with reorder mutation args ', () => {
    const prefixName = 'Home';
    const placeConfig: ThingConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name' }],
    };
    const personConfig: ThingConfig = {};
    Object.assign(personConfig, {
      name: 'Person',
      type: 'tangible',
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
      'mutation Home_createPerson($data: PersonCreateInput!) {',
      '  createPerson(data: $data) {',
    ];

    const result = composeActionArgs(prefixName, personConfig, createThingMutationAttributes, {});
    expect(result).toEqual(expectedResult);
  });
});
