/* eslint-env jest */

import type { EntityConfig, GeneralConfig, TangibleEntityConfig } from '../../tsTypes';

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
          type: 'textFields',
        },
      ],
    };

    const generalConfig: GeneralConfig = { allEntityConfigs: { Example: entityConfig } };

    const expectedResult = [
      'mutation Home_createExample($data: ExampleCreateInput!, $token: String) {',
      '  createExample(data: $data, token: $token) {',
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

    const personConfig = {} as TangibleEntityConfig;

    const placeConfig: EntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name', type: 'textFields' }],
      relationalFields: [
        {
          name: 'citisens',
          oppositeName: 'location',
          config: personConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
        {
          name: 'customers',
          oppositeName: 'favoritePlace',
          config: personConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
      ],
    };
    Object.assign(personConfig, {
      name: 'Person',
      type: 'tangible',
      relationalFields: [
        {
          name: 'friends',
          oppositeName: 'fellows',
          config: personConfig,
          array: true,
          required: true,
          type: 'relationalFields',
        },
        {
          name: 'fellows',
          oppositeName: 'friends',
          config: personConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
        {
          name: 'enemies',
          oppositeName: 'opponents',
          config: personConfig,
          array: true,
          type: 'relationalFields',
        },
        {
          name: 'opponents',
          oppositeName: 'enemies',
          config: personConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
        {
          name: 'location',
          oppositeName: 'citisens',
          config: placeConfig,
          required: true,
          type: 'relationalFields',
        },
        {
          name: 'favoritePlace',
          oppositeName: 'customers',
          config: placeConfig,
          type: 'relationalFields',
        },
      ],
    });

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Person: personConfig, Place: placeConfig },
    };

    const expectedResult = [
      'mutation Home_createPerson($data: PersonCreateInput!, $token: String) {',
      '  createPerson(data: $data, token: $token) {',
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
