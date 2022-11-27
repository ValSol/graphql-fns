// @flow
/* eslint-env jest */

import type { EntityConfig } from '../../flowTypes';

import createEntityMutationAttributes from '../actionAttributes/createEntityMutationAttributes';
import composeStandardActionSignature from '../composeStandardActionSignature';

describe('createCreateEntityMutationType', () => {
  test('should create mutation add entity type', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
    };
    const expectedResult = '  createExample(data: ExampleCreateInput!): Example!';
    const dic = {};

    const result = composeStandardActionSignature(
      entityConfig,
      createEntityMutationAttributes,
      dic,
    );

    expect(result).toEqual(expectedResult);
  });

  test('should create mutation add entity type', () => {
    const placeConfig: EntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name' }],
    };
    const personConfig: EntityConfig = {};
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
    const expectedResult = '  createPerson(data: PersonCreateInput!): Person!';

    const dic = {};

    const result = composeStandardActionSignature(
      personConfig,
      createEntityMutationAttributes,
      dic,
    );
    expect(result).toEqual(expectedResult);
  });
});
