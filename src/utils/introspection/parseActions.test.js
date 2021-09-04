// @flow
/* eslint-env jest */
import type { ActionSignatureMethods, DerivativeAttributes, ThingConfig } from '../../flowTypes';

import parseActions from './parseActions';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';

describe('parseActions', () => {
  const countryConfig: ThingConfig = {
    name: 'Country',
    textFields: [
      {
        name: 'title',
      },
    ],
  };
  const placeConfig: ThingConfig = {
    name: 'Place',
    textFields: [
      {
        name: 'title',
      },
    ],
    relationalFields: [
      {
        name: 'country',
        config: countryConfig,
      },
    ],
  };
  const personConfig: ThingConfig = {};
  Object.assign(personConfig, {
    name: 'Person',
    textFields: [
      {
        name: 'firstName',
      },
      {
        name: 'secondName',
      },
    ],
    relationalFields: [
      {
        name: 'friends',
        array: true,
        config: personConfig,
      },
      {
        name: 'place',
        config: placeConfig,
      },
    ],
    duplexFields: [
      {
        name: 'parent',
        config: personConfig,
        oppositeName: 'children',
      },
      {
        name: 'children',
        array: true,
        config: personConfig,
        oppositeName: 'parent',
      },
    ],
  });

  const getThing: ActionSignatureMethods = {
    name: 'getThing',
    specificName: ({ name }) => `get${name}`,
    argNames: () => [],
    argTypes: () => [],
    type: ({ name }) => `${name}!`,
    config: (thingConfig) => thingConfig,
  };

  const putThing: ActionSignatureMethods = {
    name: 'putThing',
    specificName: ({ name }) => `get${name}`,
    argNames: () => [],
    argTypes: () => [],
    type: ({ name }) => `${name}!`,
    config: (thingConfig, generalConfig) =>
      composeDerivativeConfigByName('ForCatalog', thingConfig, generalConfig),
  };

  const ForCatalog: DerivativeAttributes = {
    suffix: 'ForCatalog',
    allow: {
      Person: ['thingsByUnique', 'childThings', 'childThing', 'thingCount'],
      Place: ['childThing'],
      Country: ['childThing'],
    },

    derivativeFields: {
      Person: {
        friends: 'ForCatalog',
        place: 'ForCatalog',
        parent: 'ForCatalog',
        children: 'ForCatalog',
      },
      Place: {
        country: 'ForCatalog',
      },
    },
  };

  const thingConfigs = { Person: personConfig, Place: placeConfig, Country: countryConfig };
  const custom = { Query: { getThing, putThing } };
  const derivative = { ForCatalog };

  const generalConfig = { thingConfigs, custom, derivative };

  const suffixToPermission = { ForCatalog: 'insider', ForView: '' };

  test('should return result', () => {
    const args = [
      {
        actionType: 'Query',
        actionName: 'thingsByUniqueForCatalog',
        thingName: 'Person',
        options: { shift: 0, depth: 1 },
      },
      {
        actionType: 'Query',
        actionName: 'thingsByUnique',
        thingName: 'Person',
        options: { shift: 0, depth: 1 },
        suffix: 'ForView',
      },
    ];

    const expectedResult = {
      derivativeAttributes: {
        ForCatalog: {
          allow: {
            Country: ['childThing'],
            Person: ['thingsByUnique', 'childThings', 'childThing'],
            Place: ['childThing'],
          },
          suffix: 'ForCatalog',
        },
      },
      inventoryByPermissions: {
        '': {
          include: {
            Query: {
              childThing: ['Place', 'Person', 'Country'],
              childThings: ['Person'],
              thingsByUnique: ['Person'],
            },
          },
          name: '',
        },
        insider: {
          include: {
            Query: {
              childThingForCatalog: ['Place', 'Person', 'Country'],
              childThingsForCatalog: ['Person'],
              thingsByUniqueForCatalog: ['Person'],
            },
          },
          name: 'insider',
        },
      },
      maxShift: 1,
    };

    const result = parseActions(args, suffixToPermission, generalConfig);
    expect(result).toEqual(expectedResult);
  });
});
