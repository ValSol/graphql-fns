/* eslint-env jest */

import type { EntityConfig, GeneralConfig, Inventory, TangibleEntityConfig } from '../../tsTypes';

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
          type: 'textFields',
        },
      ],
    };

    const generalConfig: GeneralConfig = { allEntityConfigs: { Example: entityConfig } };

    const expectedResult =
      '  updateExample(whereOne: ExampleWhereOneInput!, data: ExampleUpdateInput!, token: String): Example!';

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
      textFields: [{ name: 'city', type: 'textFields' }],
    };

    const personConfig = {} as TangibleEntityConfig;

    const placeConfig: EntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name', type: 'textFields' }],

      relationalFields: [
        {
          name: 'location',
          oppositeName: 'citizens',
          config: personConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
        {
          name: 'favoritePlace',
          oppositeName: 'customers',
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

      embeddedFields: [{ name: 'address', config: addressConfig, type: 'embeddedFields' }],

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
          oppositeName: 'citizens',
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

    const inventory: Inventory = {
      name: 'test',
      exclude: { Query: { childEntities: true, childEntitiesThroughConnection: true } },
    };

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Person: personConfig, Place: placeConfig, Address: addressConfig },
      inventory,
    };

    const expectedResult =
      '  updatePerson(whereOne: PersonWhereOneInput!, data: PersonUpdateInput!, token: String): Person!';

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
