/* eslint-env jest */
import type { ActionSignatureMethods, DescendantAttributes, EntityConfig } from '../../tsTypes';
import type { ParseActionArgs } from './tsTypes';

import parseActions from './parseActions';
import composeDescendantConfigByName from '../composeDescendantConfigByName';

describe('parseActions', () => {
  const countryConfig: EntityConfig = {
    name: 'Country',
    type: 'tangible',
    textFields: [
      {
        name: 'title',
        type: 'textFields',
      },
    ],
  };
  const placeConfig: EntityConfig = {
    name: 'Place',
    type: 'tangible',
    textFields: [
      {
        name: 'title',
        type: 'textFields',
      },
    ],
    relationalFields: [
      {
        name: 'country',
        config: countryConfig,
        type: 'relationalFields',
      },
    ],
  };
  const personConfig = {} as EntityConfig;
  Object.assign(personConfig, {
    name: 'Person',
    type: 'tangible',
    textFields: [
      {
        name: 'firstName',
        type: 'textFields',
      },
      {
        name: 'secondName',
        type: 'textFields',
      },
    ],
    relationalFields: [
      {
        name: 'friends',
        array: true,
        config: personConfig,
        type: 'relationalFields',
      },
      {
        name: 'place',
        config: placeConfig,
        type: 'relationalFields',
      },
    ],
    duplexFields: [
      {
        name: 'parent',
        config: personConfig,
        oppositeName: 'children',
        type: 'duplexFields',
      },
      {
        name: 'children',
        array: true,
        config: personConfig,
        oppositeName: 'parent',
        type: 'duplexFields',
      },
    ],
  });

  const getEntity: ActionSignatureMethods = {
    name: 'getEntity',
    specificName: ({ name }: any) => `get${name}`,
    argNames: () => [],
    argTypes: () => [],
    involvedEntityNames: ({ name }: any) => ({ inputOutputEntity: name }),
    type: ({ name }: any) => `${name}!`,
    config: (entityConfig: any) => entityConfig,
  };

  const putThing: ActionSignatureMethods = {
    name: 'putThing',
    specificName: ({ name }: any) => `get${name}`,
    argNames: () => [],
    argTypes: () => [],
    involvedEntityNames: ({ name }: any) => ({ inputOutputEntity: name }),
    type: ({ name }: any) => `${name}!`,
    config: (entityConfig: any, generalConfig: any) =>
      composeDescendantConfigByName('ForCatalog', entityConfig, generalConfig),
  };

  const ForCatalog: DescendantAttributes = {
    descendantKey: 'ForCatalog',
    allow: {
      Person: ['entitiesByUnique', 'childEntities', 'childEntity', 'entityCount'],
      Place: ['childEntity'],
      Country: ['childEntity'],
    },

    descendantFields: {
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

  const allEntityConfigs = {
    Person: personConfig,
    Place: placeConfig,
    Country: countryConfig,
  };
  const custom = { Query: { getEntity, putThing } };
  const descendant = { ForCatalog };

  const generalConfig = { allEntityConfigs, custom, descendant };

  const descendantKeyToPermission = { ForCatalog: 'insider', ForView: '' };

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
        descendantKey: 'ForView',
      },
    ];

    const expectedResult = {
      descendantAttributes: {
        ForCatalog: {
          allow: {
            Country: ['childEntity'],
            Person: ['entitiesByUnique', 'childEntities', 'childEntity'],
            Place: ['childEntity'],
          },
          descendantKey: 'ForCatalog',
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
      maxShift: 1,
    };

    const result = parseActions(
      args as ParseActionArgs[],
      descendantKeyToPermission,
      generalConfig,
    );
    expect(result).toEqual(expectedResult);
  });
});
