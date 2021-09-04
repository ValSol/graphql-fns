// @flow
/* eslint-env jest */
import type { ActionSignatureMethods, DerivativeAttributes, ThingConfig } from '../../flowTypes';

import parseActionName from './parseActionName';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';

describe('parseActionName', () => {
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

  const getThing: ActionSignatureMethods = {
    name: 'getThing',
    specificName: ({ name }) => `get${name}`,
    argNames: () => [],
    argTypes: () => [],
    type: ({ name }) => `${name}!`,
    config: (thingConfig) => thingConfig,
  };

  const putThing: ActionSignatureMethods = {
    name: 'putThing',
    specificName: ({ name }) => `get${name}`,
    argNames: () => [],
    argTypes: () => [],
    type: ({ name }) => `${name}!`,
    config: (thingConfig, generalConfig) =>
      composeDerivativeConfigByName('ForCatalog', thingConfig, generalConfig),
  };

  const ForCatalog: DerivativeAttributes = {
    suffix: 'ForCatalog',
    allow: {
      Person: ['thingsByUnique', 'childThings', 'childThing', 'thingCount'],
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
  const custom = { Query: { getThing, putThing } };
  const derivative = { ForCatalog };

  const generalConfig = { thingConfigs, custom, derivative };

  test('should return result for thingsByUnique action', () => {
    const actionType = 'Query';
    const actionName = 'thingsByUnique';
    const thingName = 'Person';
    const suffix = 'ForCabinet';
    const expectedResult = {
      creationType: 'standard',
      thingConfig: thingConfigs.Person,
      baseAction: '',
      suffix: 'ForCabinet',
    };

    const result = parseActionName({ actionType, actionName, thingName, suffix }, generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should return result for thingCount action', () => {
    const actionType = 'Query';
    const actionName = 'thingCount';
    const thingName = 'Person';
    const suffix = 'ForCabinet';
    const expectedResult = {
      creationType: 'standard',
      thingConfig: null,
      baseAction: '',
      suffix: 'ForCabinet',
    };

    const result = parseActionName({ actionType, actionName, thingName, suffix }, generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should return result for getThing action', () => {
    const actionType = 'Query';
    const actionName = 'getThing';
    const thingName = 'Person';
    const suffix = 'ForCabinet';
    const expectedResult = {
      creationType: 'custom',
      thingConfig: thingConfigs.Person,
      baseAction: '',
      suffix: 'ForCabinet',
    };

    const result = parseActionName({ actionType, actionName, thingName, suffix }, generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should return result for putThing action', () => {
    const actionType = 'Query';
    const actionName = 'putThing';
    const thingName = 'Person';
    const expectedResult = {
      creationType: 'custom',
      thingConfig: composeDerivativeConfigByName('ForCatalog', thingConfigs.Person, generalConfig),
      baseAction: '',
      suffix: 'ForCatalog',
    };

    const result = parseActionName({ actionType, actionName, thingName }, generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should return result for thingsByUniqueForCatalog action', () => {
    const actionType = 'Query';
    const actionName = 'thingsByUniqueForCatalog';
    const thingName = 'Person';
    const expectedResult = {
      creationType: 'derivative',
      thingConfig: composeDerivativeConfigByName('ForCatalog', thingConfigs.Person, generalConfig),
      baseAction: 'thingsByUnique',
      suffix: 'ForCatalog',
    };

    const result = parseActionName({ actionType, actionName, thingName }, generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should return result for thingCountForCatalog action', () => {
    const actionType = 'Query';
    const actionName = 'thingCountForCatalog';
    const thingName = 'Person';
    const expectedResult = {
      creationType: 'derivative',
      thingConfig: null,
      baseAction: 'thingCount',
      suffix: 'ForCatalog',
    };

    const result = parseActionName({ actionType, actionName, thingName }, generalConfig);
    expect(result).toEqual(expectedResult);
  });
});
