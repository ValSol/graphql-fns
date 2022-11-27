// @flow
/* eslint-env jest */

import { makeExecutableSchema } from '@graphql-tools/schema';

import type { Enums, GeneralConfig, EntityConfig } from './flowTypes';

import composeGqlTypes from './types/composeGqlTypes';
import composeGqlResolvers from './resolvers/composeGqlResolvers';

describe('graphql schema', () => {
  test('test simle schema', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField1',
        },
        {
          name: 'textField2',
          default: 'default text',
        },
        {
          name: 'textField3',
          required: true,
        },
        {
          name: 'textField4',
          array: true,
        },
        {
          name: 'textField5',
          default: ['default text'],
          required: true,
          array: true,
        },
      ],
    };
    const entityConfigs = { Example: entityConfig };
    const generalConfig: GeneralConfig = { entityConfigs };
    const typeDefs = composeGqlTypes(generalConfig);
    const resolvers = composeGqlResolvers(generalConfig);
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });
    expect(schema).not.toBeUndefined();
  });

  test('test schema with enumerations', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField1',
          unique: true,
        },
        {
          name: 'textField2',
          default: 'default text',
          index: true,
        },
        {
          name: 'textField3',
          required: true,
          index: true,
        },
        {
          name: 'textField4',
          array: true,
        },
        {
          name: 'textField5',
          default: ['default text'],
          required: true,
          array: true,
        },
      ],
      enumFields: [
        {
          name: 'day',
          enumName: 'Weekdays',
          index: true,
        },
        {
          name: 'cuisines',
          array: true,
          enumName: 'Cuisines',
          required: true,
          index: true,
        },
      ],

      geospatialFields: [
        {
          name: 'position',
          geospatialType: 'Point',
        },
      ],
    };
    const entityConfigs = { Example: entityConfig };
    const enums: Enums = [
      { name: 'Weekdays', enum: ['a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6'] },
      { name: 'Cuisines', enum: ['ukrainian', 'italian', 'georgian', 'japanese', 'chinese'] },
    ];
    const generalConfig: GeneralConfig = { entityConfigs, enums };
    const typeDefs = composeGqlTypes(generalConfig);

    const resolvers = composeGqlResolvers(generalConfig);
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });
    expect(schema).not.toBeUndefined();
  });

  test('test schema with embedded fields', () => {
    const addressConfig: EntityConfig = {
      name: 'Address',
      type: 'embedded',
      textFields: [
        {
          name: 'country',
          required: true,
          default: 'Ukraine',
        },
        {
          name: 'province',
        },
      ],
    };
    const personConfig: EntityConfig = {
      name: 'Person',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          required: true,
        },
        {
          name: 'lastName',
          required: true,
        },
      ],
      embeddedFields: [
        {
          name: 'location',
          config: addressConfig,
          required: true,
        },
        {
          name: 'locations',
          array: true,
          config: addressConfig,
          required: true,
        },
        {
          name: 'place',
          config: addressConfig,
        },
        {
          name: 'places',
          array: true,
          config: addressConfig,
        },
      ],
    };
    const entityConfigs = { Person: personConfig, Address: addressConfig };
    const generalConfig: GeneralConfig = { entityConfigs };
    const typeDefs = composeGqlTypes(generalConfig);
    const resolvers = composeGqlResolvers(generalConfig);

    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });

    expect(schema).not.toBeUndefined();
  });

  test('test schema with duplex fields', () => {
    const personConfig: EntityConfig = {};
    const placeConfig: EntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name' }],
      duplexFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
          array: true,
          config: personConfig,
        },
        {
          name: 'visitors',
          oppositeName: 'favoritePlace',
          array: true,
          config: personConfig,
        },
      ],
    };
    Object.assign(personConfig, {
      name: 'Person',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          required: true,
        },
        {
          name: 'lastName',
          required: true,
        },
      ],
      duplexFields: [
        {
          name: 'friends',
          oppositeName: 'friends',
          config: personConfig,
          array: true,
          required: true,
        },
        {
          name: 'enemies',
          oppositeName: 'enemies',
          array: true,
          config: personConfig,
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          config: placeConfig,
          required: true,
        },
        {
          name: 'favoritePlace',
          oppositeName: 'visitors',
          config: placeConfig,
        },
      ],
    });
    const entityConfigs = { Person: personConfig, Place: placeConfig };
    const generalConfig: GeneralConfig = { entityConfigs };
    const typeDefs = composeGqlTypes(generalConfig);
    const resolvers = composeGqlResolvers(generalConfig);
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });
    expect(schema).not.toBeUndefined();
  });

  describe('test schemas with differnet variants of inventory', () => {
    const personConfig: EntityConfig = {};
    const placeConfig: EntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name' }],
      duplexFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
          array: true,
          config: personConfig,
        },
        {
          name: 'visitors',
          oppositeName: 'favoritePlace',
          array: true,
          config: personConfig,
        },
      ],
    };
    Object.assign(personConfig, {
      name: 'Person',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          required: true,
        },
        {
          name: 'lastName',
          required: true,
        },
      ],
      duplexFields: [
        {
          name: 'friends',
          oppositeName: 'friends',
          config: personConfig,
          array: true,
          required: true,
        },
        {
          name: 'enemies',
          oppositeName: 'enemies',
          array: true,
          config: personConfig,
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          config: placeConfig,
          required: true,
        },
        {
          name: 'favoritePlace',
          oppositeName: 'visitors',
          config: placeConfig,
        },
      ],
    });
    const entityConfigs = { Person: personConfig, Place: placeConfig };
    const generalConfig: GeneralConfig = { entityConfigs };
    generalConfig.inventory = {
      name: 'test',
      include: {
        Mutation: true,
        Query: { entity: true, entities: true, childEntity: true, childEntities: true },
      },
    };

    let typeDefs = composeGqlTypes(generalConfig);
    let resolvers = composeGqlResolvers(generalConfig);

    let schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });

    test('test schema with only mutations in inventory', () => {
      expect(schema).not.toBeUndefined();
    });

    test('test schema with only createEntity mutations in inventory', () => {
      generalConfig.inventory = {
        name: 'test',
        include: {
          Mutation: { createEntity: true },
          Query: { childEntity: true, childEntities: true },
        },
      };

      typeDefs = composeGqlTypes(generalConfig);
      resolvers = composeGqlResolvers(generalConfig);
      schema = makeExecutableSchema({
        typeDefs,
        resolvers,
      });
      expect(schema).not.toBeUndefined();
    });

    test('test schema with only createPerson mutations in inventory', () => {
      generalConfig.inventory = {
        name: 'test',
        include: {
          Mutation: { createEntity: ['Person'] },
          Query: { childEntity: true, childEntities: true },
        },
      };

      typeDefs = composeGqlTypes(generalConfig);
      resolvers = composeGqlResolvers(generalConfig);
      schema = makeExecutableSchema({
        typeDefs,
        resolvers,
      });
      expect(schema).not.toBeUndefined();
    });

    test('test schema with only quries in inventory', () => {
      generalConfig.inventory = { name: 'test', include: { Query: true } };

      typeDefs = composeGqlTypes(generalConfig);
      resolvers = composeGqlResolvers(generalConfig);
      schema = makeExecutableSchema({
        typeDefs,
        resolvers,
      });
      expect(schema).not.toBeUndefined();
    });

    test('test schema with only entity query in inventory', () => {
      generalConfig.inventory = {
        name: 'test',
        include: { Query: { childEntity: true, childEntities: true } },
      };

      typeDefs = composeGqlTypes(generalConfig);
      resolvers = composeGqlResolvers(generalConfig);
      schema = makeExecutableSchema({
        typeDefs,
        resolvers,
      });
      expect(schema).not.toBeUndefined();
    });
  });
});
