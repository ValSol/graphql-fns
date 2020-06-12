// @flow
/* eslint-env jest */

import pluralize from 'pluralize';

import type { DerivativeAttributes, GeneralConfig, ThingConfig } from '../../flowTypes';

import composeDerivativeThingsQuery from './composeDerivativeThingsQuery';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeActionSignature from '../../types/composeActionSignature';

describe('composeDerivativeThingsQuery', () => {
  const thingConfig: ThingConfig = {
    name: 'Example',
    textFields: [
      {
        name: 'textField',
      },
    ],
  };

  const sortThingConfig: ThingConfig = {
    name: 'SortExample',
    textFields: [
      {
        name: 'textField',
        index: true,
      },
    ],
  };

  const paginationThingConfig: ThingConfig = {
    name: 'PaginationExample',
    pagination: true,
    textFields: [
      {
        name: 'textField',
      },
    ],
  };

  const nearThingConfig: ThingConfig = {
    name: 'NearExample',
    geospatialFields: [
      {
        name: 'position',
        geospatialType: 'Point',
      },
    ],
  };

  const ForCatalog: DerivativeAttributes = {
    allowedRootNames: ['Example', 'SortExample'],
    suffix: 'ForCatalog',
    config: (config) => ({
      ...config,
      floatFields: [{ name: 'floatField' }],
    }),
  };

  const derivative = { ForCatalog };

  const generalConfig: GeneralConfig = {
    thingConfigs: {
      Example: thingConfig,
      SortExample: sortThingConfig,
      PaginationExample: paginationThingConfig,
    },
    derivative,
  };

  const result = composeDerivativeThingsQuery(ForCatalog);

  test('should return inputs for "thingConfig"', () => {
    const expectedResult = {
      name: ({ name }) =>
        ForCatalog.allowedRootNames.includes(name) ? `${pluralize(name)}ForCatalog` : '',
      argNames: () => ['where'],
      argTypes: ({ name }) => [`${name}WhereInput`],
      type: ({ name }) => `[${name}ForCatalog!]!`,
      config: (thingConfig2, generalConfig2) =>
        composeDerivativeConfigByName('ForCatalog', thingConfig2, generalConfig2),
    };

    const result2 = composeActionSignature(result, thingConfig, generalConfig);

    const expectedResult2 = composeActionSignature(expectedResult, thingConfig, generalConfig);

    expect(result2).toEqual(expectedResult2);
  });

  test('should return inputs for "sortThingConfig"', () => {
    const expectedResult = {
      name: ({ name }) =>
        ForCatalog.allowedRootNames.includes(name) ? `${pluralize(name)}ForCatalog` : '',
      argNames: () => ['where', 'sort'],
      argTypes: ({ name }) => [`${name}WhereInput`, `${name}SortInput`],
      type: ({ name }) => `[${name}ForCatalog!]!`,
      config: (thingConfig2, generalConfig2) =>
        composeDerivativeConfigByName('ForCatalog', thingConfig2, generalConfig2),
    };

    const result2 = composeActionSignature(result, sortThingConfig, generalConfig);

    const expectedResult2 = composeActionSignature(expectedResult, sortThingConfig, generalConfig);

    expect(result2).toEqual(expectedResult2);
  });

  test('should return inputs for "paginationThingConfig"', () => {
    const expectedResult = {
      name: ({ name }) =>
        ForCatalog.allowedRootNames.includes(name) ? `${pluralize(name)}ForCatalog` : '',
      argNames: () => ['where', 'pagination'],
      argTypes: ({ name }) => [`${name}WhereInput`, `${name}PaginationInput`],
      type: ({ name }) => `[${name}ForCatalog!]!`,
      config: (thingConfig2, generalConfig2) =>
        composeDerivativeConfigByName('ForCatalog', thingConfig2, generalConfig2),
    };

    const result2 = composeActionSignature(result, paginationThingConfig, generalConfig);

    const expectedResult2 = composeActionSignature(
      expectedResult,
      paginationThingConfig,
      generalConfig,
    );

    expect(result2).toEqual(expectedResult2);
  });

  test('should return inputs for "nearThingConfig"', () => {
    const expectedResult = {
      name: ({ name }) =>
        ForCatalog.allowedRootNames.includes(name) ? `${pluralize(name)}ForCatalog` : '',
      argNames: () => ['where', 'near'],
      argTypes: ({ name }) => [`${name}WhereInput`, `${name}NearInput`],
      type: ({ name }) => `[${name}ForCatalog!]!`,
      config: (thingConfig2, generalConfig2) =>
        composeDerivativeConfigByName('ForCatalog', thingConfig2, generalConfig2),
    };

    const result2 = composeActionSignature(result, nearThingConfig, generalConfig);

    const expectedResult2 = composeActionSignature(expectedResult, nearThingConfig, generalConfig);

    expect(result2).toEqual(expectedResult2);
  });
});
