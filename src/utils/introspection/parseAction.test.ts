/* eslint-env jest */
import type {
  ActionSignatureMethods,
  DescendantAttributes,
  EntityConfig,
  TangibleEntityConfig,
} from '../../tsTypes';
import type { ParseActionResult } from './tsTypes';

import parseAction from './parseAction';
import composeDescendantConfigByName from '../composeDescendantConfigByName';

describe('parseAction', () => {
  const placeConfig = {} as TangibleEntityConfig;
  const personConfig = {} as EntityConfig;
  const countryConfig: EntityConfig = {
    name: 'Country',
    type: 'tangible',
    textFields: [
      {
        name: 'title',
        type: 'textFields',
      },
    ],
    relationalFields: [
      {
        name: 'places',
        oppositeName: 'country',
        config: placeConfig,
        array: true,
        parent: true,
        type: 'relationalFields',
      },
    ],
  };
  Object.assign(placeConfig, {
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
        oppositeName: 'places',
        config: countryConfig,
        type: 'relationalFields',
      },
      {
        name: 'citisens',
        oppositeName: 'place',
        config: personConfig,
        array: true,
        parent: true,
        type: 'relationalFields',
      },
    ],
  });

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
        oppositeName: 'fellows',
        array: true,
        config: personConfig,
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
        name: 'place',
        oppositeName: 'citisens',
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
      Place: ['childEntity', 'childEntities'],
      Country: ['childEntity', 'childEntities'],
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
    const actionType = 'Query';
    const actionName = 'entitiesByUniqueForCatalog';
    const entityName = 'Person';
    const options = { shift: 0, depth: 1 };

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
        descendantKeyToPermission,
        entityName,
      },
      { descendantAttributes: {}, inventoryByRoles: {}, maxShift: 0 },
    );
    expect(result).toEqual(expectedResult);
  });

  test('should return result', () => {
    const actionType = 'Query';
    const actionName = 'entitiesByUnique';
    const entityName = 'Person';
    const options = { shift: 0, depth: 1 };
    const descendantKey = 'ForView';

    const parseActionResult: ParseActionResult = {
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
      maxShift: 3,
    };

    const result = parseAction(
      {
        actionType,
        actionName,
        generalConfig,
        options,
        descendantKey,
        descendantKeyToPermission,
        entityName,
      },
      parseActionResult,
    );
    expect(result).toEqual(expectedResult);
  });
});
