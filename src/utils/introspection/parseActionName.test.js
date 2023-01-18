// @flow
/* eslint-env jest */
import type { ActionSignatureMethods, DerivativeAttributes, EntityConfig } from '../../flowTypes';

import parseActionName from './parseActionName';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';

describe('parseActionName', () => {
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
    involvedEntityNames: ({ name }) => ({ inputOutputEntity: name }),
    type: ({ name }) => `${name}!`,
    config: (entityConfig) => entityConfig,
  };

  const putThing: ActionSignatureMethods = {
    name: 'putThing',
    specificName: ({ name }) => `get${name}`,
    argNames: () => [],
    argTypes: () => [],
    involvedEntityNames: ({ name }) => ({ inputOutputEntity: name }),
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
