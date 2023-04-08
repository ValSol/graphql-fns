/* eslint-env jest */

import type { EntityConfig, GeneralConfig, Inventory } from '../../tsTypes';

import updateEntityMutationAttributes from '../actionAttributes/updateEntityMutationAttributes';
import composeActionSignature from '../composeActionSignature';

describe('createUpdateEntityMutationType', () => {
  test('should create mutation update entity type', () => {
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

    const expectedResult =
      '  updateExample(whereOne: ExampleWhereOneInput!, data: ExampleUpdateInput!): Example!';

    const entityTypeDic: { [entityName: string]: string } = {};

    const inputDic: { [inputName: string]: string } = {};

    const result = composeActionSignature(
      entityConfig,
      generalConfig,
      updateEntityMutationAttributes,
      entityTypeDic,
      inputDic,
    );
    expect(result).toEqual(expectedResult);
  });

  test('should create mutation update entity type with ReorderCreatedInputType', () => {
    const addressConfig: EntityConfig = {
      name: 'Address',
      type: 'embedded',
      textFields: [{ name: 'city' }],
    };

    const placeConfig: EntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name' }],
    };
    const personConfig = {} as EntityConfig;
    Object.assign(personConfig, {
      name: 'Person',
      type: 'tangible',

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

    const inventory: Inventory = {
      name: 'test',
      exclude: { Query: { childEntities: true, childEntitiesThroughConnection: true } },
    };

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Person: personConfig, Place: placeConfig, Address: addressConfig },
      inventory,
    };

    const expectedResult =
      '  updatePerson(whereOne: PersonWhereOneInput!, data: PersonUpdateInput!): Person!';

    const entityTypeDic: { [entityName: string]: string } = {};

    const inputDic: { [inputName: string]: string } = {};

    const result = composeActionSignature(
      personConfig,
      generalConfig,
      updateEntityMutationAttributes,
      entityTypeDic,
      inputDic,
    );
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

    expect(inputDic).toEqual(expectedDic);
  });
});
