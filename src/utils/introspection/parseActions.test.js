// @flow
/* eslint-env jest */
import type { ActionSignatureMethods, DerivativeAttributes, EntityConfig } from '../../flowTypes';

import parseActions from './parseActions';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';

describe('parseActions', () => {
  const countryConfig: EntityConfig = {
    name: 'Country',
    type: 'tangible',
    textFields: [
      {
        name: 'title',
      },
    ],
  };
  const placeConfig: EntityConfig = {
    name: 'Place',
    type: 'tangible',
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
  const personConfig: EntityConfig = {};
  Object.assign(personConfig, {
    name: 'Person',
    type: 'tangible',
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

  const getEntity: ActionSignatureMethods = {
    name: 'getEntity',
    specificName: ({ name }) => `get${name}`,
    argNames: () => [],
    argTypes: () => [],
    type: ({ name }) => `${name}!`,
    config: (entityConfig) => entityConfig,
  };

  const putThing: ActionSignatureMethods = {
    name: 'putThing',
    specificName: ({ name }) => `get${name}`,
    argNames: () => [],
    argTypes: () => [],
    type: ({ name }) => `${name}!`,
    config: (entityConfig, generalConfig) =>
      composeDerivativeConfigByName('ForCatalog', entityConfig, generalConfig),
  };

  const ForCatalog: DerivativeAttributes = {
    suffix: 'ForCatalog',
    allow: {
      Person: ['entitiesByUnique', 'childEntities', 'childEntity', 'entityCount'],
      Place: ['childEntity'],
      Country: ['childEntity'],
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

  const allEntityConfigs = { Person: personConfig, Place: placeConfig, Country: countryConfig };
  const custom = { Query: { getEntity, putThing } };
  const derivative = { ForCatalog };

  const generalConfig = { allEntityConfigs, custom, derivative };

  const suffixToPermission = { ForCatalog: 'insider', ForView: '' };

  test('should return result', () => {
    const args = [
      {
        actionType: 'Query',
        actionName: 'entitiesByUniqueForCatalog',
        entityName: 'Person',
        options: { shift: 0, depth: 1 },
      },
      {
        actionType: 'Query',
        actionName: 'entitiesByUnique',
        entityName: 'Person',
        options: { shift: 0, depth: 1 },
        suffix: 'ForView',
      },
    ];

    const expectedResult = {
      derivativeAttributes: {
        ForCatalog: {
          allow: {
            Country: ['childEntity'],
            Person: ['entitiesByUnique', 'childEntities', 'childEntity'],
            Place: ['childEntity'],
          },
          suffix: 'ForCatalog',
        },
      },
      inventoryByPermissions: {
        '': {
          include: {
            Query: {
              childEntity: ['Place', 'Person', 'Country'],
              childEntities: ['Person'],
              entitiesByUnique: ['Person'],
            },
          },
          name: '',
        },
        insider: {
          include: {
            Query: {
              childEntityForCatalog: ['Place', 'Person', 'Country'],
              childEntitiesForCatalog: ['Person'],
              entitiesByUniqueForCatalog: ['Person'],
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
