/* eslint-env jest */
import type { ActionSignatureMethods, DerivativeAttributes, EntityConfig } from '../../tsTypes';

import parseActionName from './parseActionName';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';

describe('parseActionName', () => {
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

  const allEntityConfigs = {
    Person: personConfig,
    Place: placeConfig,
    Country: countryConfig,
  };
  const custom = { Query: { getEntity, putThing } };
  const derivative = { ForCatalog };

  const generalConfig = { allEntityConfigs, custom, derivative };

  test('should return result for entitiesByUnique action', () => {
    const actionType = 'Query';
    const actionName = 'entitiesByUnique';
    const entityName = 'Person';
    const derivativeKey = 'ForCabinet';
    const expectedResult = {
      creationType: 'standard',
      entityConfig: allEntityConfigs.Person,
      baseAction: '',
      derivativeKey: 'ForCabinet',
    };

    const result = parseActionName(
      { actionType, actionName, entityName, derivativeKey },
      generalConfig,
    );
    expect(result).toEqual(expectedResult);
  });

  test('should return result for entityCount action', () => {
    const actionType = 'Query';
    const actionName = 'entityCount';
    const entityName = 'Person';
    const derivativeKey = 'ForCabinet';
    const expectedResult = {
      creationType: 'standard',
      entityConfig: null,
      baseAction: '',
      derivativeKey: 'ForCabinet',
    };

    const result = parseActionName(
      { actionType, actionName, entityName, derivativeKey },
      generalConfig,
    );
    expect(result).toEqual(expectedResult);
  });

  test('should return result for getEntity action', () => {
    const actionType = 'Query';
    const actionName = 'getEntity';
    const entityName = 'Person';
    const derivativeKey = 'ForCabinet';
    const expectedResult = {
      creationType: 'custom',
      entityConfig: allEntityConfigs.Person,
      baseAction: '',
      derivativeKey: 'ForCabinet',
    };

    const result = parseActionName(
      { actionType, actionName, entityName, derivativeKey },
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
      entityConfig: composeDerivativeConfigByName(
        'ForCatalog',
        allEntityConfigs.Person,
        generalConfig,
      ),
      baseAction: '',
      derivativeKey: 'ForCatalog',
    };

    const result = parseActionName({ actionType, actionName, entityName }, generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should return result for entitiesByUniqueForCatalog action', () => {
    const actionType = 'Query';
    const actionName = 'entitiesByUniqueForCatalog';
    const entityName = 'Person';
    const expectedResult = {
      creationType: 'derivative',
      entityConfig: composeDerivativeConfigByName(
        'ForCatalog',
        allEntityConfigs.Person,
        generalConfig,
      ),
      baseAction: 'entitiesByUnique',
      derivativeKey: 'ForCatalog',
    };

    const result = parseActionName({ actionType, actionName, entityName }, generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should return result for thingCountForCatalog action', () => {
    const actionType = 'Query';
    const actionName = 'entityCountForCatalog';
    const entityName = 'Person';
    const expectedResult = {
      creationType: 'derivative',
      entityConfig: null,
      baseAction: 'entityCount',
      derivativeKey: 'ForCatalog',
    };

    const result = parseActionName({ actionType, actionName, entityName }, generalConfig);
    expect(result).toEqual(expectedResult);
  });
});
