// @flow
/* eslint-env jest */

import type { Enums, GeneralConfig, ThingConfig } from './flowTypes';

const { makeExecutableSchema } = require('apollo-server');

const composeGqlTypes = require('./types/composeGqlTypes');
const composeGqlResolvers = require('./resolvers/composeGqlResolvers');

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
    const thingConfigs = [thingConfig];
    const enums: Enums = [];
    const generalConfig: GeneralConfig = { thingConfigs, enums };
    const typeDefs = composeGqlTypes(generalConfig);
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
          type: 'Point',
        },
      ],
    };
    const thingConfigs = [thingConfig];
    const enums: Enums = [
      { name: 'Weekdays', enum: ['a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6'] },
      { name: 'Cuisines', enum: ['ukrainian', 'italian', 'georgian', 'japanese', 'chinese'] },
    ];
    const generalConfig: GeneralConfig = { thingConfigs, enums };
    const typeDefs = composeGqlTypes(generalConfig);
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
      isEmbedded: true,
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
    const thingConfigs = [personConfig, addressConfig];
    const enums: Enums = [];
    const generalConfig: GeneralConfig = { thingConfigs, enums };
    const typeDefs = composeGqlTypes(generalConfig);
    const resolvers = composeGqlResolvers(generalConfig);
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });
    expect(schema).not.toBeUndefined();
  });

  test('test schema with duplicate fields', () => {
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
    const thingConfigs = [personConfig, placeConfig];
    const enums: Enums = [];
    const generalConfig: GeneralConfig = { thingConfigs, enums };
    const typeDefs = composeGqlTypes(generalConfig);
    const resolvers = composeGqlResolvers(generalConfig);
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });
    expect(schema).not.toBeUndefined();
  });
});
