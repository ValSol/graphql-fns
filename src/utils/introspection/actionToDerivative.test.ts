/* eslint-env jest */
import type {
  ActionSignatureMethods,
  DerivativeAttributes,
  TangibleEntityConfig,
} from '../../tsTypes';
import type { ActionToParse, ParsedAction } from './tsTypes';

import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import actionToDerivative from './actionToDerivative';

describe('actionToDerivative', () => {
  const countryConfig: TangibleEntityConfig = {
    name: 'Country',
    type: 'tangible',
    textFields: [
      {
        name: 'title',
        type: 'textFields',
      },
    ],
  };
  const placeConfig: TangibleEntityConfig = {
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
  const personConfig = {} as TangibleEntityConfig;
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

  const signatureMethods: ActionSignatureMethods = {
    name: 'getEntity',
    specificName: ({ name }: any) => `get${name}`,
    argNames: () => [],
    argTypes: () => [],
    involvedEntityNames: ({ name }: any) => ({ inputOutputEntity: name }),
    type: ({ name }: any) => `${name}!`,
    config: (entityConfig: any) => entityConfig,
  };

  const ForCatalog: DerivativeAttributes = {
    derivativeKey: 'ForCatalog',
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

  const allEntityConfigs = {
    Person: personConfig,
    Place: placeConfig,
    Country: countryConfig,
  };
  const queryName = 'getEntity';
  const custom = { Query: { [queryName]: signatureMethods } };
  const derivative = { ForCatalog };

  const generalConfig = { allEntityConfigs, custom, derivative };

  test('have to return derivativeAttributes with Person: [entitiesByUnique]', () => {
    const actionToParse: ActionToParse = {
      actionType: 'Query',
      actionName: 'thingsByUniqueForCatalog',
      entityName: 'Person',
    };

    const parsedAction: ParsedAction = {
      creationType: 'derivative',
      entityConfig: composeDerivativeConfigByName('ForCatalog', personConfig, generalConfig),
      baseAction: 'entitiesByUnique',
      derivativeKey: 'ForCatalog',
    };

    const derivativeAttributes: { [derivativeKey: string]: DerivativeAttributes } = {};

    const expectedResult = {
      ForCatalog: {
        derivativeKey: 'ForCatalog',
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
    const actionToParse: ActionToParse = {
      actionType: 'Query',
      actionName: 'entitiesForCatalog',
      entityName: 'Person',
    };

    const parsedAction: ParsedAction = {
      creationType: 'derivative',
      entityConfig: composeDerivativeConfigByName('ForCatalog', personConfig, generalConfig),
      baseAction: 'entities',
      derivativeKey: 'ForCatalog',
    };

    const derivativeAttributes: { [derivativeKey: string]: DerivativeAttributes } = {
      ForCatalog: {
        derivativeKey: 'ForCatalog',
        allow: {
          Person: ['entitiesByUnique'],
        },
      },
    };

    const expectedResult = {
      ForCatalog: {
        derivativeKey: 'ForCatalog',
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
