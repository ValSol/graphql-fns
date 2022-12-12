// @flow
/* eslint-env jest */

import { makeExecutableSchema } from '@graphql-tools/schema';

import type { Enums, GeneralConfig, SimplifiedEntityConfig } from './flowTypes';

import composeAllEntityConfigs from './utils/composeAllEntityConfigs';
import composeGqlTypes from './types/composeGqlTypes';
import composeGqlResolvers from './resolvers/composeGqlResolvers';

describe('graphql schema', () => {
  test('test simple schema', () => {
    const entityConfig: SimplifiedEntityConfig = {
      name: 'Example',
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

    const simplifiedAllEntityConfigs = [entityConfig];
    const allEntityConfigs = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    const generalConfig: GeneralConfig = { allEntityConfigs };
    const typeDefs = composeGqlTypes(generalConfig);
    const resolvers = composeGqlResolvers(generalConfig);
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });
    expect(schema).not.toBeUndefined();
  });

  test('test schema with enumerations', () => {
    const entityConfig: SimplifiedEntityConfig = {
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

    const simplifiedAllEntityConfigs = [entityConfig];
    const allEntityConfigs = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    const enums: Enums = [
      { name: 'Weekdays', enum: ['a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6'] },
      { name: 'Cuisines', enum: ['ukrainian', 'italian', 'georgian', 'japanese', 'chinese'] },
    ];
    const generalConfig: GeneralConfig = { allEntityConfigs, enums };
    const typeDefs = composeGqlTypes(generalConfig);

    const resolvers = composeGqlResolvers(generalConfig);
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });
    expect(schema).not.toBeUndefined();
  });

  test('test schema with embedded fields', () => {
    const addressConfig: SimplifiedEntityConfig = {
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
    const personConfig: SimplifiedEntityConfig = {
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
          configName: 'Address',
          required: true,
        },
        {
          name: 'locations',
          array: true,
          configName: 'Address',
          required: true,
        },
        {
          name: 'place',
          configName: 'Address',
        },
        {
          name: 'places',
          array: true,
          configName: 'Address',
        },
      ],
    };

    const simplifiedAllEntityConfigs = [personConfig, addressConfig];
    const allEntityConfigs = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    const generalConfig: GeneralConfig = { allEntityConfigs };
    const typeDefs = composeGqlTypes(generalConfig);
    const resolvers = composeGqlResolvers(generalConfig);

    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });

    expect(schema).not.toBeUndefined();
  });

  test('test schema with duplex fields', () => {
    const placeConfig: SimplifiedEntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name' }],
      duplexFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
          array: true,
          configName: 'Person',
        },
        {
          name: 'visitors',
          oppositeName: 'favoritePlace',
          array: true,
          configName: 'Person',
        },
      ],
    };
    const personConfig = {
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
          configName: 'Person',
          array: true,
          required: true,
        },
        {
          name: 'enemies',
          oppositeName: 'enemies',
          array: true,
          configName: 'Person',
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          configName: 'Place',
          required: true,
        },
        {
          name: 'favoritePlace',
          oppositeName: 'visitors',
          configName: 'Place',
        },
      ],
    };

    const simplifiedAllEntityConfigs = [personConfig, placeConfig];
    const allEntityConfigs = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    const generalConfig: GeneralConfig = { allEntityConfigs };
    const typeDefs = composeGqlTypes(generalConfig);
    const resolvers = composeGqlResolvers(generalConfig);
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });
    expect(schema).not.toBeUndefined();
  });

  describe('test schemas with differnet variants of inventory', () => {
    const personConfig: SimplifiedEntityConfig = {};
    const placeConfig: SimplifiedEntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name' }],
      duplexFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
          array: true,
          configName: 'Person',
        },
        {
          name: 'visitors',
          oppositeName: 'favoritePlace',
          array: true,
          configName: 'Person',
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
          configName: 'Person',
          array: true,
          required: true,
        },
        {
          name: 'enemies',
          oppositeName: 'enemies',
          array: true,
          configName: 'Person',
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          configName: 'Place',
          required: true,
        },
        {
          name: 'favoritePlace',
          oppositeName: 'visitors',
          configName: 'Place',
        },
      ],
    });

    const simplifiedAllEntityConfigs = [personConfig, placeConfig];
    const allEntityConfigs = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    const generalConfig: GeneralConfig = { allEntityConfigs };
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
