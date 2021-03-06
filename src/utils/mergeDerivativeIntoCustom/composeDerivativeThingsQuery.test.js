// @flow
/* eslint-env jest */

import pluralize from 'pluralize';

import type { DerivativeAttributes, GeneralConfig, ThingConfig } from '../../flowTypes';

import thingsQueryAttributes from '../../types/actionAttributes/thingsQueryAttributes';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeActionSignature from '../../types/composeActionSignature';
import composeCustomAction from './composeCustomAction';

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

  const addedFields = {
    floatFields: [{ name: 'floatField' }],
  };
  const ForCatalog: DerivativeAttributes = {
    allow: {
      Example: ['thing', 'things'],
      SortExample: ['thing', 'things'],
      PaginationExample: ['thing', 'things'],
      NearExample: ['thing', 'things'],
    },

    suffix: 'ForCatalog',
    addFields: {
      Example: () => addedFields,
      SortExample: () => addedFields,
      PaginationExample: () => addedFields,
      NearExample: () => addedFields,
    },
  };

  const derivative = { ForCatalog };

  const generalConfig: GeneralConfig = {
    thingConfigs: {
      Example: thingConfig,
      SortExample: sortThingConfig,
      PaginationExample: paginationThingConfig,
      NearExample: nearThingConfig,
    },
    derivative,
  };

  const result = composeCustomAction(ForCatalog, thingsQueryAttributes);

  test('should return inputs for "thingConfig"', () => {
    const expectedResult = {
      name: 'thingsForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('things')
          ? `${pluralize(name)}ForCatalog`
          : '',
      argNames: () => ['where', 'sort'],
      argTypes: ({ name }) => [`${name}ForCatalogWhereInput`, `${name}ForCatalogSortInput`],
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
      name: 'thingsForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('things')
          ? `${pluralize(name)}ForCatalog`
          : '',
      argNames: () => ['where', 'sort'],
      argTypes: ({ name }) => [`${name}ForCatalogWhereInput`, `${name}ForCatalogSortInput`],
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
      name: 'thingsForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('things')
          ? `${pluralize(name)}ForCatalog`
          : '',
      argNames: () => ['where', 'sort', 'pagination'],
      argTypes: ({ name }) => [
        `${name}ForCatalogWhereInput`,
        `${name}ForCatalogSortInput`,
        'PaginationInput',
      ],
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
      name: 'thingsForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('things')
          ? `${pluralize(name)}ForCatalog`
          : '',
      argNames: () => ['where', 'sort', 'near'],
      argTypes: ({ name }) => [
        `${name}ForCatalogWhereInput`,
        `${name}ForCatalogSortInput`,
        `${name}ForCatalogNearInput`,
      ],
      type: ({ name }) => `[${name}ForCatalog!]!`,
      config: (thingConfig2, generalConfig2) =>
        composeDerivativeConfigByName('ForCatalog', thingConfig2, generalConfig2),
    };

    const result2 = composeActionSignature(result, nearThingConfig, generalConfig);

    const expectedResult2 = composeActionSignature(expectedResult, nearThingConfig, generalConfig);

    expect(result2).toEqual(expectedResult2);
  });
});
