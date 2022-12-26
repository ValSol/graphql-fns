// @flow
/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import createEntityMutationAttributes from '../../types/actionAttributes/createEntityMutationAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeCreateEntityMutationArgs', () => {
  test('should compose createEntity mutation args ', () => {
    const prefixName = 'Home';
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const generalConfig: GeneralConfig = { allEntityConfigs: { Example: entityConfig } };

    const expectedResult = [
      'mutation Home_createExample($data: ExampleCreateInput!) {',
      '  createExample(data: $data) {',
    ];

    const result = composeActionArgs(
      prefixName,
      entityConfig,
      generalConfig,
      createEntityMutationAttributes,
      {},
    );
    expect(result).toEqual(expectedResult);
  });

  test('should compose createEntity with reorder mutation args ', () => {
    const prefixName = 'Home';
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

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Person: personConfig, Place: placeConfig },
    };

    const expectedResult = [
      'mutation Home_createPerson($data: PersonCreateInput!) {',
      '  createPerson(data: $data) {',
    ];

    const result = composeActionArgs(
      prefixName,
      personConfig,
      generalConfig,
      createEntityMutationAttributes,
      {},
    );
    expect(result).toEqual(expectedResult);
  });
});
