// @flow
/* eslint-env jest */
import type { ActionSignatureMethods, DerivativeAttributes, ThingConfig } from '../../flowTypes';

import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import actionToDerivative from './actionToDerivative';

describe('actionToDerivative', () => {
  const countryConfig: ThingConfig = {
    name: 'Country',
    textFields: [
      {
        name: 'title',
      },
    ],
  };
  const placeConfig: ThingConfig = {
    name: 'Place',
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
  const personConfig: ThingConfig = {};
  Object.assign(personConfig, {
    name: 'Person',
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
    name: 'getThing',
    specificName: ({ name }) => `get${name}`,
    argNames: () => [],
    argTypes: () => [],
    type: ({ name }) => `${name}!`,
    config: (thingConfig) => thingConfig,
  };

  const ForCatalog: DerivativeAttributes = {
    suffix: 'ForCatalog',
    allow: {
      Person: ['thingsByUnique', 'childThings', 'childThing'],
      Place: ['childThing'],
      Country: ['childThing'],
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

  const thingConfigs = { Person: personConfig, Place: placeConfig, Country: countryConfig };
  const queryName = 'getThing';
  const custom = { Query: { [queryName]: signatureMethods } };
  const derivative = { ForCatalog };

  const generalConfig = { thingConfigs, custom, derivative };

  test('have to return derivativeAttributes with Person: [thingsByUnique]', () => {
    const actionToParse = {
      actionType: 'Query',
      actionName: 'thingsByUniqueForCatalog',
      thingName: 'Person',
    };

    const parsedAction = {
      creationType: 'derivative',
      thingConfig: composeDerivativeConfigByName('ForCatalog', personConfig, generalConfig),
      baseAction: 'thingsByUnique',
      suffix: 'ForCatalog',
    };

    const derivativeAttributes = {};

    const expectedResult = {
      ForCatalog: {
        suffix: 'ForCatalog',
        allow: {
          Person: ['thingsByUnique'],
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

  test('have to return derivativeAttributes with Person: [things]', () => {
    const actionToParse = {
      actionType: 'Query',
      actionName: 'thingsForCatalog',
      thingName: 'Person',
    };

    const parsedAction = {
      creationType: 'derivative',
      thingConfig: composeDerivativeConfigByName('ForCatalog', personConfig, generalConfig),
      baseAction: 'things',
      suffix: 'ForCatalog',
    };

    const derivativeAttributes = {
      ForCatalog: {
        suffix: 'ForCatalog',
        allow: {
          Person: ['thingsByUnique'],
        },
      },
    };

    const expectedResult = {
      ForCatalog: {
        suffix: 'ForCatalog',
        allow: {
          Person: ['thingsByUnique', 'things'],
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
