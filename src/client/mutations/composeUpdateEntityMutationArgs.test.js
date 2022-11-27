// @flow
/* eslint-env jest */

import type { EntityConfig } from '../../flowTypes';

import updateEntityMutationAttributes from '../../types/actionAttributes/updateEntityMutationAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeUpdateEntityMutationArgs', () => {
  test('should compose updateEntity mutation args ', () => {
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

    const expectedResult = [
      'mutation Home_updateExample($whereOne: ExampleWhereOneInput!, $data: ExampleUpdateInput!) {',
      '  updateExample(whereOne: $whereOne, data: $data) {',
    ];

    const result = composeActionArgs(prefixName, entityConfig, updateEntityMutationAttributes, {});
    expect(result).toEqual(expectedResult);
  });

  test('should compose updateEntity with reorder mutation args ', () => {
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

    const expectedResult = [
      'mutation Home_updatePerson($whereOne: PersonWhereOneInput!, $data: PersonUpdateInput!) {',
      '  updatePerson(whereOne: $whereOne, data: $data) {',
    ];

    const result = composeActionArgs(prefixName, personConfig, updateEntityMutationAttributes, {});
    expect(result).toEqual(expectedResult);
  });
});
