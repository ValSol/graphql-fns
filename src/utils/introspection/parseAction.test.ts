/* eslint-env jest */
import type {
  ActionSignatureMethods,
  RepresentationAttributes,
  EntityConfig,
  TangibleEntityConfig,
} from '../../tsTypes';
import type { ParseActionResult } from './tsTypes';

import parseAction from './parseAction';
import composeRepresentationConfigByName from '../composeRepresentationConfigByName';

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
      composeRepresentationConfigByName('ForCatalog', entityConfig, generalConfig),
  };

  const ForCatalog: RepresentationAttributes = {
    representationKey: 'ForCatalog',
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
  const representation = { ForCatalog };

  const generalConfig = { allEntityConfigs, custom, representation };

  const representationKeyToPermission = { ForCatalog: 'insider', ForView: '' };

  test('should return result', () => {
    const actionType = 'Query';
    const actionName = 'entitiesByUniqueForCatalog';
    const entityName = 'Person';
    const options = { shift: 0, depth: 1 };

    const expectedResult = {
      representationAttributes: {
        ForCatalog: {
          allow: {
            Country: ['childEntity'],
            Person: ['entitiesByUnique', 'childEntities', 'childEntity'],
            Place: ['childEntity'],
          },
          representationKey: 'ForCatalog',
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
        representationKeyToPermission,
        entityName,
      },
      { representationAttributes: {}, inventoryByRoles: {}, maxShift: 0 },
    );
    expect(result).toEqual(expectedResult);
  });

  test('should return result', () => {
    const actionType = 'Query';
    const actionName = 'entitiesByUnique';
    const entityName = 'Person';
    const options = { shift: 0, depth: 1 };
    const representationKey = 'ForView';

    const parseActionResult: ParseActionResult = {
      representationAttributes: {
        ForCatalog: {
          allow: {
            Country: ['childEntity'],
            Person: ['entitiesByUnique', 'childEntities', 'childEntity'],
            Place: ['childEntity'],
          },
          representationKey: 'ForCatalog',
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
      representationAttributes: {
        ForCatalog: {
          allow: {
            Country: ['childEntity'],
            Person: ['entitiesByUnique', 'childEntities', 'childEntity'],
            Place: ['childEntity'],
          },
          representationKey: 'ForCatalog',
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
        representationKey,
        representationKeyToPermission,
        entityName,
      },
      parseActionResult,
    );
    expect(result).toEqual(expectedResult);
  });
});
