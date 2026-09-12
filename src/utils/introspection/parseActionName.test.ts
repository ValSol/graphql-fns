/* eslint-env jest */
import type {
  ActionSignatureMethods,
  RepresentationAttributes,
  EntityConfig,
  TangibleEntityConfig,
} from '../../tsTypes';

import parseActionName from './parseActionName';
import composeRepresentationConfigByName from '../composeRepresentationConfigByName';

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
      composeRepresentationConfigByName('ForCatalog', entityConfig, generalConfig),
  };

  const ForCatalog: RepresentationAttributes = {
    representationKey: 'ForCatalog',
    allow: {
      Person: ['entitiesByUnique', 'childEntities', 'childEntity', 'entityCount'],
      Place: ['childEntity', 'childEntities'],
      Country: ['childEntity'],
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

  test('should return result for entitiesByUnique action', () => {
    const actionType = 'Query';
    const actionName = 'entitiesByUnique';
    const entityName = 'Person';
    const representationKey = 'ForCabinet';
    const expectedResult = {
      creationType: 'standard',
      entityConfig: allEntityConfigs.Person,
      baseAction: '',
      representationKey: 'ForCabinet',
    };

    const result = parseActionName(
      { actionType, actionName, entityName, representationKey },
      generalConfig,
    );
    expect(result).toEqual(expectedResult);
  });

  test('should return result for entityCount action', () => {
    const actionType = 'Query';
    const actionName = 'entityCount';
    const entityName = 'Person';
    const representationKey = 'ForCabinet';
    const expectedResult = {
      creationType: 'standard',
      entityConfig: null,
      baseAction: '',
      representationKey: 'ForCabinet',
    };

    const result = parseActionName(
      { actionType, actionName, entityName, representationKey },
      generalConfig,
    );
    expect(result).toEqual(expectedResult);
  });

  test('should return result for getEntity action', () => {
    const actionType = 'Query';
    const actionName = 'getEntity';
    const entityName = 'Person';
    const representationKey = 'ForCabinet';
    const expectedResult = {
      creationType: 'custom',
      entityConfig: allEntityConfigs.Person,
      baseAction: '',
      representationKey: 'ForCabinet',
    };

    const result = parseActionName(
      { actionType, actionName, entityName, representationKey },
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
      entityConfig: composeRepresentationConfigByName(
        'ForCatalog',
        allEntityConfigs.Person,
        generalConfig,
      ),
      baseAction: '',
      representationKey: 'ForCatalog',
    };

    const result = parseActionName({ actionType, actionName, entityName }, generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should return result for entitiesByUniqueForCatalog action', () => {
    const actionType = 'Query';
    const actionName = 'entitiesByUniqueForCatalog';
    const entityName = 'Person';
    const expectedResult = {
      creationType: 'representation',
      entityConfig: composeRepresentationConfigByName(
        'ForCatalog',
        allEntityConfigs.Person,
        generalConfig,
      ),
      baseAction: 'entitiesByUnique',
      representationKey: 'ForCatalog',
    };

    const result = parseActionName({ actionType, actionName, entityName }, generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should return result for thingCountForCatalog action', () => {
    const actionType = 'Query';
    const actionName = 'entityCountForCatalog';
    const entityName = 'Person';
    const expectedResult = {
      creationType: 'representation',
      entityConfig: null,
      baseAction: 'entityCount',
      representationKey: 'ForCatalog',
    };

    const result = parseActionName({ actionType, actionName, entityName }, generalConfig);
    expect(result).toEqual(expectedResult);
  });
});
