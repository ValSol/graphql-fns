// @flow
/* eslint-env jest */

import type { DerivativeAttributes, GeneralConfig, ThingConfig } from '../../flowTypes';

import thingCountQueryAttributes from '../../types/actionAttributes/thingCountQueryAttributes';
import composeActionSignature from '../../types/composeActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeDerivativeThingCountQuery', () => {
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
      Example: ['thingCount', 'things'],
      SortExample: ['thingCount', 'things'],
      PaginationExample: ['thingCount', 'things'],
      NearExample: ['thingCount', 'things'],
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

  const result = composeCustomAction(ForCatalog, thingCountQueryAttributes);

  test('should return inputs for "thingConfig"', () => {
    const expectedResult = {
      name: 'thingCountForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('thingCount')
          ? `${name}CountForCatalog`
          : '',
      argNames: () => ['where'],
      argTypes: ({ name }) => [`${name}ForCatalogWhereInput`],
      type: () => 'Int!',
      config: () => null,
    };

    const result2 = composeActionSignature(result, thingConfig, generalConfig);

    const expectedResult2 = composeActionSignature(expectedResult, thingConfig, generalConfig);

    expect(result2).toEqual(expectedResult2);
  });

  test('should return inputs for "sortThingConfig"', () => {
    const expectedResult = {
      name: 'thingCountForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('thingCount')
          ? `${name}CountForCatalog`
          : '',
      argNames: () => ['where'],
      argTypes: ({ name }) => [`${name}ForCatalogWhereInput`],
      type: () => 'Int!',
      config: () => null,
    };

    const result2 = composeActionSignature(result, sortThingConfig, generalConfig);

    const expectedResult2 = composeActionSignature(expectedResult, sortThingConfig, generalConfig);

    expect(result2).toEqual(expectedResult2);
  });

  test('should return inputs for "paginationThingConfig"', () => {
    const expectedResult = {
      name: 'thingCountForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('thingCount')
          ? `${name}CountForCatalog`
          : '',
      argNames: () => ['where'],
      argTypes: ({ name }) => [`${name}ForCatalogWhereInput`],
      type: () => 'Int!',
      config: () => null,
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
      name: 'thingCountForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('thingCount')
          ? `${name}CountForCatalog`
          : '',
      argNames: () => ['where', 'near'],
      argTypes: ({ name }) => [`${name}ForCatalogWhereInput`, `${name}ForCatalogNearInput`],
      type: () => 'Int!',
      config: () => null,
    };

    const result2 = composeActionSignature(result, nearThingConfig, generalConfig);

    const expectedResult2 = composeActionSignature(expectedResult, nearThingConfig, generalConfig);
    expect(result2).toEqual(expectedResult2);
  });
});
