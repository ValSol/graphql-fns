// @flow
/* eslint-env jest */

import { makeExecutableSchema } from 'apollo-server';

import type { Enums, GeneralConfig, ThingConfig } from './flowTypes';

import composeGqlTypes from './types/composeGqlTypes';
import composeGqlResolvers from './resolvers/composeGqlResolvers';

describe('graphql schema', () => {
  test('test simle schema', () => {
    const thingConfig: ThingConfig = {
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
    const thingConfigs = { Example: thingConfig };
    const generalConfig: GeneralConfig = { thingConfigs };
    const typeDefs = `scalar Upload\n${composeGqlTypes(generalConfig)}`;
    const resolvers = composeGqlResolvers(generalConfig);
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });
    expect(schema).not.toBeUndefined();
  });

  test('test schema with enumerations', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      pagination: true,
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
    const thingConfigs = { Example: thingConfig };
    const enums: Enums = [
      { name: 'Weekdays', enum: ['a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6'] },
      { name: 'Cuisines', enum: ['ukrainian', 'italian', 'georgian', 'japanese', 'chinese'] },
    ];
    const generalConfig: GeneralConfig = { thingConfigs, enums };
    const typeDefs = `scalar Upload\n${composeGqlTypes(generalConfig)}`;
    const resolvers = composeGqlResolvers(generalConfig);
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });
    expect(schema).not.toBeUndefined();
  });

  test('test schema with embedded fields', () => {
    const addressConfig: ThingConfig = {
      name: 'Address',
      embedded: true,
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
    const personConfig: ThingConfig = {
      name: 'Person',
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
    const thingConfigs = { Person: personConfig, Address: addressConfig };
    const generalConfig: GeneralConfig = { thingConfigs };
    const typeDefs = `scalar Upload\n${composeGqlTypes(generalConfig)}`;
    const resolvers = composeGqlResolvers(generalConfig);
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });
    expect(schema).not.toBeUndefined();
  });

  test('test schema with duplex fields', () => {
    const personConfig: ThingConfig = {};
    const placeConfig: ThingConfig = {
      name: 'Place',
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
    const thingConfigs = { Person: personConfig, Place: placeConfig };
    const generalConfig: GeneralConfig = { thingConfigs };
    const typeDefs = `scalar Upload\n${composeGqlTypes(generalConfig)}`;
    const resolvers = composeGqlResolvers(generalConfig);
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });
    expect(schema).not.toBeUndefined();
  });

  describe('test schemas with differnet variants of inventory', () => {
    const personConfig: ThingConfig = {};
    const placeConfig: ThingConfig = {
      name: 'Place',
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
    const thingConfigs = { Person: personConfig, Place: placeConfig };
    const generalConfig: GeneralConfig = { thingConfigs };
    generalConfig.inventory = { include: { Mutation: null, Query: { thing: null, things: null } } };
    let typeDefs = `scalar Upload\n${composeGqlTypes(generalConfig)}`;
    let resolvers = composeGqlResolvers(generalConfig);
    let schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });

    test('test schema with only mutations in inventory', () => {
      expect(schema).not.toBeUndefined();
    });

    test('test schema with only createThing mutations in inventory', () => {
      generalConfig.inventory = {
        include: { Mutation: { createThing: null }, Query: { thing: null, things: null } },
      };

      typeDefs = `scalar Upload\n${composeGqlTypes(generalConfig)}`;
      resolvers = composeGqlResolvers(generalConfig);
      schema = makeExecutableSchema({
        typeDefs,
        resolvers,
      });
      expect(schema).not.toBeUndefined();
    });

    test('test schema with only createPerson mutations in inventory', () => {
      generalConfig.inventory = {
        include: { Mutation: { createThing: ['Person'] }, Query: { thing: null, things: null } },
      };

      typeDefs = `scalar Upload\n${composeGqlTypes(generalConfig)}`;
      resolvers = composeGqlResolvers(generalConfig);
      schema = makeExecutableSchema({
        typeDefs,
        resolvers,
      });
      expect(schema).not.toBeUndefined();
    });

    test('test schema with only quries in inventory', () => {
      generalConfig.inventory = { include: { Query: null } };

      typeDefs = `scalar Upload\n${composeGqlTypes(generalConfig)}`;
      resolvers = composeGqlResolvers(generalConfig);
      schema = makeExecutableSchema({
        typeDefs,
        resolvers,
      });
      expect(schema).not.toBeUndefined();
    });

    test('test schema with only thing query in inventory', () => {
      generalConfig.inventory = { include: { Query: { thing: null, things: null } } };

      typeDefs = `scalar Upload\n${composeGqlTypes(generalConfig)}`;
      resolvers = composeGqlResolvers(generalConfig);
      schema = makeExecutableSchema({
        typeDefs,
        resolvers,
      });
      expect(schema).not.toBeUndefined();
    });
  });
});
