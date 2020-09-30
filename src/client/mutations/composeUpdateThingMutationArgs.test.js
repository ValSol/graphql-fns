// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeUpdateThingMutationArgs from './composeUpdateThingMutationArgs';

describe('composeUpdateThingMutationArgs', () => {
  test('should compose updateThing mutation args ', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = [
      'mutation updateExample($whereOne: ExampleWhereOneInput!, $data: ExampleUpdateInput!) {',
      '  updateExample(whereOne: $whereOne, data: $data) {',
    ];

    const result = composeUpdateThingMutationArgs(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should compose updateThing with reorder mutation args ', () => {
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
      'mutation updatePerson($whereOne: PersonWhereOneInput!, $data: PersonUpdateInput!, $positions: PersonReorderCreatedInput) {',
      '  updatePerson(whereOne: $whereOne, data: $data, positions: $positions) {',
    ];

    const result = composeUpdateThingMutationArgs(personConfig);
    expect(result).toEqual(expectedResult);
  });
});
