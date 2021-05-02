// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import createThingMutationAttributes from '../actionAttributes/createThingMutationAttributes';
import composeStandardActionSignature from '../composeStandardActionSignature';

describe('createCreateThingMutationType', () => {
  test('should create mutation add thing type', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
    };
    const expectedResult = '  createExample(data: ExampleCreateInput!): Example!';
    const dic = {};

    const result = composeStandardActionSignature(thingConfig, createThingMutationAttributes, dic);

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
    const expectedResult = '  createPerson(data: PersonCreateInput!): Person!';

    const dic = {};

    const result = composeStandardActionSignature(personConfig, createThingMutationAttributes, dic);
    expect(result).toEqual(expectedResult);
  });
});
