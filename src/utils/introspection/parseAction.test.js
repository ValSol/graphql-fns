// @flow
/* eslint-env jest */
import type { ActionSignatureMethods, DerivativeAttributes, EntityConfig } from '../../flowTypes';

import parseAction from './parseAction';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';

describe('parseAction', () => {
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
    involvedEntityNames: ({ name }) => ({ inputEntity: name }),
    type: ({ name }) => `${name}!`,
    config: (entityConfig) => entityConfig,
  };

  const putThing: ActionSignatureMethods = {
    name: 'putThing',
    specificName: ({ name }) => `get${name}`,
    argNames: () => [],
    argTypes: () => [],
    involvedEntityNames: ({ name }) => ({ inputEntity: name }),
    type: ({ name }) => `${name}!`,
    config: (entityConfig, generalConfig) =>
      composeDerivativeConfigByName('ForCatalog', entityConfig, generalConfig),
  };

  const ForCatalog: DerivativeAttributes = {
    derivativeKey: 'ForCatalog',
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

  const derivativeKeyToPermission = { ForCatalog: 'insider', ForView: '' };

  test('should return result', () => {
    const actionType = 'Query';
    const actionName = 'entitiesByUniqueForCatalog';
    const entityName = 'Person';
    const options = { shift: 0, depth: 1 };

    const expectedResult = {
      derivativeAttributes: {
        ForCatalog: {
          allow: {
            Country: ['childEntity'],
            Person: ['entitiesByUnique', 'childEntities', 'childEntity'],
            Place: ['childEntity'],
          },
          derivativeKey: 'ForCatalog',
        },
      },
      inventoryByRoles: {
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

    const result = parseAction(
      {
        actionType,
        actionName,
        generalConfig,
        options,
        derivativeKeyToPermission,
        entityName,
      },
      { derivativeAttributes: {}, inventoryByRoles: {}, maxShift: 0 },
    );
    expect(result).toEqual(expectedResult);
  });

  test('should return result', () => {
    const actionType = 'Query';
    const actionName = 'entitiesByUnique';
    const entityName = 'Person';
    const options = { shift: 0, depth: 1 };
    const derivativeKey = 'ForView';

    const parseActionResult = {
      derivativeAttributes: {
        ForCatalog: {
          allow: {
            Country: ['childEntity'],
            Person: ['entitiesByUnique', 'childEntities', 'childEntity'],
            Place: ['childEntity'],
          },
          derivativeKey: 'ForCatalog',
        },
      },
      inventoryByRoles: {
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
      maxShift: 3,
    };

    const expectedResult = {
      derivativeAttributes: {
        ForCatalog: {
          allow: {
            Country: ['childEntity'],
            Person: ['entitiesByUnique', 'childEntities', 'childEntity'],
            Place: ['childEntity'],
          },
          derivativeKey: 'ForCatalog',
        },
      },
      inventoryByRoles: {
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
      maxShift: 3,
    };

    const result = parseAction(
      {
        actionType,
        actionName,
        generalConfig,
        options,
        derivativeKey,
        derivativeKeyToPermission,
        entityName,
      },
      parseActionResult,
    );
    expect(result).toEqual(expectedResult);
  });
});
