// @flow
/* eslint-env jest */
import type { ActionSignatureMethods, DerivativeAttributes, EntityConfig } from '../../flowTypes';

import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import actionToDerivative from './actionToDerivative';

describe('actionToDerivative', () => {
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

  const signatureMethods: ActionSignatureMethods = {
    name: 'getEntity',
    specificName: ({ name }) => `get${name}`,
    argNames: () => [],
    argTypes: () => [],
    type: ({ name }) => `${name}!`,
    config: (entityConfig) => entityConfig,
  };

  const ForCatalog: DerivativeAttributes = {
    suffix: 'ForCatalog',
    allow: {
      Person: ['entitiesByUnique', 'childEntities', 'childEntity'],
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
  const queryName = 'getEntity';
  const custom = { Query: { [queryName]: signatureMethods } };
  const derivative = { ForCatalog };

  const generalConfig = { allEntityConfigs, custom, derivative };

  test('have to return derivativeAttributes with Person: [entitiesByUnique]', () => {
    const actionToParse = {
      actionType: 'Query',
      actionName: 'thingsByUniqueForCatalog',
      entityName: 'Person',
    };

    const parsedAction = {
      creationType: 'derivative',
      entityConfig: composeDerivativeConfigByName('ForCatalog', personConfig, generalConfig),
      baseAction: 'entitiesByUnique',
      suffix: 'ForCatalog',
    };

    const derivativeAttributes = {};

    const expectedResult = {
      ForCatalog: {
        suffix: 'ForCatalog',
        allow: {
          Person: ['entitiesByUnique'],
        },
      },
    };

    const result = actionToDerivative(
      actionToParse,
      parsedAction,
      derivativeAttributes,
      generalConfig,
    );

    expect(result).toEqual(expectedResult);
  });

  test('have to return derivativeAttributes with Person: [entities]', () => {
    const actionToParse = {
      actionType: 'Query',
      actionName: 'entitiesForCatalog',
      entityName: 'Person',
    };

    const parsedAction = {
      creationType: 'derivative',
      entityConfig: composeDerivativeConfigByName('ForCatalog', personConfig, generalConfig),
      baseAction: 'entities',
      suffix: 'ForCatalog',
    };

    const derivativeAttributes = {
      ForCatalog: {
        suffix: 'ForCatalog',
        allow: {
          Person: ['entitiesByUnique'],
        },
      },
    };

    const expectedResult = {
      ForCatalog: {
        suffix: 'ForCatalog',
        allow: {
          Person: ['entitiesByUnique', 'entities'],
        },
      },
    };

    const result = actionToDerivative(
      actionToParse,
      parsedAction,
      derivativeAttributes,
      generalConfig,
    );

    expect(result).toEqual(expectedResult);
  });
});
