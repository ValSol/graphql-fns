// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

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

  test('have to return derivativeAttributes with Person: [thingsByUnique]', () => {
    const actionToParse = {
      actionType: 'Query',
      actionName: 'thingsByUniqueForCabinet',
      thingName: 'Person',
    };

    const parsedAction = {
      creationType: 'derivative',
      thingConfig: personConfig,
      baseAction: 'thingsByUnique',
      suffix: 'ForCabinet',
    };

    const derivativeAttributes = {};

    const expectedResult = {
      ForCabinet: {
        suffix: 'ForCabinet',
        allow: {
          Person: ['thingsByUnique'],
        },
      },
    };

    const result = actionToDerivative(actionToParse, parsedAction, derivativeAttributes);

    expect(result).toEqual(expectedResult);
  });

  test('have to return derivativeAttributes with Person: [things]', () => {
    const actionToParse = {
      actionType: 'Query',
      actionName: 'thingsForCabinet',
      thingName: 'Person',
    };

    const parsedAction = {
      creationType: 'derivative',
      thingConfig: personConfig,
      baseAction: 'things',
      suffix: 'ForCabinet',
    };

    const derivativeAttributes = {
      ForCabinet: {
        suffix: 'ForCabinet',
        allow: {
          Person: ['thingsByUnique'],
        },
      },
    };

    const expectedResult = {
      ForCabinet: {
        suffix: 'ForCabinet',
        allow: {
          Person: ['thingsByUnique', 'things'],
        },
      },
    };

    const result = actionToDerivative(actionToParse, parsedAction, derivativeAttributes);

    expect(result).toEqual(expectedResult);
  });
});
