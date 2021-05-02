// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import updateThingMutationAttributes from '../actionAttributes/updateThingMutationAttributes';
import composeStandardActionSignature from '../composeStandardActionSignature';

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
    const dic = {};

    const result = composeStandardActionSignature(thingConfig, updateThingMutationAttributes, dic);
    expect(result).toEqual(expectedResult);
  });

  test('should create mutation update thing type with ReorderCreatedInputType', () => {
    const addressConfig: ThingConfig = {
      name: 'Address',
      embedded: true,
      textFields: [{ name: 'city' }],
    };

    const placeConfig: ThingConfig = {
      name: 'Place',
      textFields: [{ name: 'name' }],
    };
    const personConfig: ThingConfig = {};
    Object.assign(personConfig, {
      name: 'Person',

      embeddedFields: [{ name: 'address', config: addressConfig }],

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
      '  updatePerson(whereOne: PersonWhereOneInput!, data: PersonUpdateInput!): Person!';
    const dic = {};

    const result = composeStandardActionSignature(personConfig, updateThingMutationAttributes, dic);
    expect(result).toEqual(expectedResult);

    const expectedDic = {
      PersonWhereOneInput: `input PersonWhereOneInput {
  id: ID!
}`,
      PersonUpdateInput: `input PersonUpdateInput {
  friends: PersonCreateOrPushChildrenInput
  enemies: PersonCreateOrPushChildrenInput
  location: PlaceCreateChildInput
  favoritePlace: PlaceCreateChildInput
  address: AddressUpdateInput
}`,
      PersonCreateInput: `input PersonCreateInput {
  id: ID
  friends: PersonCreateOrPushChildrenInput!
  enemies: PersonCreateOrPushChildrenInput
  location: PlaceCreateChildInput!
  favoritePlace: PlaceCreateChildInput
  address: AddressCreateInput
}
input PersonCreateChildInput {
  connect: ID
  create: PersonCreateInput
}
input PersonCreateOrPushChildrenInput {
  connect: [ID!]
  create: [PersonCreateInput!]
  createPositions: [Int!]
}`,
      PlaceCreateInput: `input PlaceCreateInput {
  id: ID
  name: String
}
input PlaceCreateChildInput {
  connect: ID
  create: PlaceCreateInput
}
input PlaceCreateOrPushChildrenInput {
  connect: [ID!]
  create: [PlaceCreateInput!]
  createPositions: [Int!]
}`,
      AddressCreateInput: `input AddressCreateInput {
  city: String
}`,
      AddressUpdateInput: `input AddressUpdateInput {
  city: String
}`,
    };

    expect(dic).toEqual(expectedDic);
  });
});
