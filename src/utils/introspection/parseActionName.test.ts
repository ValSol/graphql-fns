/* eslint-env jest */
import type {
  ActionSignatureMethods,
  DescendantAttributes,
  EntityConfig,
  TangibleEntityConfig,
} from '../../tsTypes';

import parseActionName from './parseActionName';
import composeDescendantConfigByName from '../composeDescendantConfigByName';

describe('parseActionName', () => {
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
        array: true,
        parent: true,
        config: personConfig,
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

  test('should return result for entitiesByUnique action', () => {
    const actionType = 'Query';
    const actionName = 'entitiesByUnique';
    const entityName = 'Person';
    const descendantKey = 'ForCabinet';
    const expectedResult = {
      creationType: 'standard',
      entityConfig: allEntityConfigs.Person,
      baseAction: '',
      descendantKey: 'ForCabinet',
    };

    const result = parseActionName(
      { actionType, actionName, entityName, descendantKey },
      generalConfig,
    );
    expect(result).toEqual(expectedResult);
  });

  test('should return result for entityCount action', () => {
    const actionType = 'Query';
    const actionName = 'entityCount';
    const entityName = 'Person';
    const descendantKey = 'ForCabinet';
    const expectedResult = {
      creationType: 'standard',
      entityConfig: null,
      baseAction: '',
      descendantKey: 'ForCabinet',
    };

    const result = parseActionName(
      { actionType, actionName, entityName, descendantKey },
      generalConfig,
    );
    expect(result).toEqual(expectedResult);
  });

  test('should return result for getEntity action', () => {
    const actionType = 'Query';
    const actionName = 'getEntity';
    const entityName = 'Person';
    const descendantKey = 'ForCabinet';
    const expectedResult = {
      creationType: 'custom',
      entityConfig: allEntityConfigs.Person,
      baseAction: '',
      descendantKey: 'ForCabinet',
    };

    const result = parseActionName(
      { actionType, actionName, entityName, descendantKey },
      generalConfig,
    );
    expect(result).toEqual(expectedResult);
  });

  test('should return result for putThing action', () => {
    const actionType = 'Query';
    const actionName = 'putThing';
    const entityName = 'Person';
    const expectedResult = {
      creationType: 'custom',
      entityConfig: composeDescendantConfigByName(
        'ForCatalog',
        allEntityConfigs.Person,
        generalConfig,
      ),
      baseAction: '',
      descendantKey: 'ForCatalog',
    };

    const result = parseActionName({ actionType, actionName, entityName }, generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should return result for entitiesByUniqueForCatalog action', () => {
    const actionType = 'Query';
    const actionName = 'entitiesByUniqueForCatalog';
    const entityName = 'Person';
    const expectedResult = {
      creationType: 'descendant',
      entityConfig: composeDescendantConfigByName(
        'ForCatalog',
        allEntityConfigs.Person,
        generalConfig,
      ),
      baseAction: 'entitiesByUnique',
      descendantKey: 'ForCatalog',
    };

    const result = parseActionName({ actionType, actionName, entityName }, generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should return result for thingCountForCatalog action', () => {
    const actionType = 'Query';
    const actionName = 'entityCountForCatalog';
    const entityName = 'Person';
    const expectedResult = {
      creationType: 'descendant',
      entityConfig: null,
      baseAction: 'entityCount',
      descendantKey: 'ForCatalog',
    };

    const result = parseActionName({ actionType, actionName, entityName }, generalConfig);
    expect(result).toEqual(expectedResult);
  });
});
