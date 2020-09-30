// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeCreateThingMutationArgs from './composeCreateThingMutationArgs';

describe('composeCreateThingMutationArgs', () => {
  test('should compose createThing mutation args ', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = [
      'mutation createExample($data: ExampleCreateInput!) {',
      '  createExample(data: $data) {',
    ];

    const result = composeCreateThingMutationArgs(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should compose createThing with reorder mutation args ', () => {
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
      'mutation createPerson($data: PersonCreateInput!, $positions: PersonReorderCreatedInput) {',
      '  createPerson(data: $data, positions: $positions) {',
    ];

    const result = composeCreateThingMutationArgs(personConfig);
    expect(result).toEqual(expectedResult);
  });
});
