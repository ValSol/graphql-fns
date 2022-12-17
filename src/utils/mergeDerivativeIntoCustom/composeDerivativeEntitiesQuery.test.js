// @flow
/* eslint-env jest */

import pluralize from 'pluralize';

import type { DerivativeAttributes, GeneralConfig, EntityConfig } from '../../flowTypes';

import entitiesQueryAttributes from '../../types/actionAttributes/entitiesQueryAttributes';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeActionSignature from '../../types/composeActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeDerivativeEntitiesQuery', () => {
  const entityConfig: EntityConfig = {
    name: 'Example',
    type: 'tangible',
    textFields: [
      {
        name: 'textField',
      },
    ],
  };

  const sortEntityConfig: EntityConfig = {
    name: 'SortExample',
    type: 'tangible',
    textFields: [
      {
        name: 'textField',
        index: true,
      },
    ],
  };

  const paginationEntityConfig: EntityConfig = {
    name: 'PaginationExample',
    type: 'tangible',
    textFields: [
      {
        name: 'textField',
      },
    ],
  };

  const nearEntityConfig: EntityConfig = {
    name: 'NearExample',
    type: 'tangible',
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
      Example: ['entity', 'entities'],
      SortExample: ['entity', 'entities'],
      PaginationExample: ['entity', 'entities'],
      NearExample: ['entity', 'entities'],
    },

    derivativeKey: 'ForCatalog',
    addFields: {
      Example: () => addedFields,
      SortExample: () => addedFields,
      PaginationExample: () => addedFields,
      NearExample: () => addedFields,
    },
  };

  const derivative = { ForCatalog };

  const generalConfig: GeneralConfig = {
    allEntityConfigs: {
      Example: entityConfig,
      SortExample: sortEntityConfig,
      PaginationExample: paginationEntityConfig,
      NearExample: nearEntityConfig,
    },
    derivative,
  };

  const result = composeCustomAction(ForCatalog, entitiesQueryAttributes);

  test('should return inputs for "entityConfig"', () => {
    const expectedResult = {
      name: 'entitiesForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('entities')
          ? `${pluralize(name)}ForCatalog`
          : '',
      argNames: () => ['where', 'sort', 'pagination'],
      argTypes: ({ name }) => [
        `${name}ForCatalogWhereInput`,
        `${name}ForCatalogSortInput`,
        'PaginationInput',
      ],
      type: ({ name }) => `[${name}ForCatalog!]!`,
      config: (entityConfig2, generalConfig2) =>
        composeDerivativeConfigByName('ForCatalog', entityConfig2, generalConfig2),
    };

    const result2 = composeActionSignature(result, entityConfig, generalConfig);

    const expectedResult2 = composeActionSignature(expectedResult, entityConfig, generalConfig);

    expect(result2).toEqual(expectedResult2);
  });

  test('should return inputs for "sortEntityConfig"', () => {
    const expectedResult = {
      name: 'entitiesForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('entities')
          ? `${pluralize(name)}ForCatalog`
          : '',
      argNames: () => ['where', 'sort', 'pagination'],
      argTypes: ({ name }) => [
        `${name}ForCatalogWhereInput`,
        `${name}ForCatalogSortInput`,
        'PaginationInput',
      ],
      type: ({ name }) => `[${name}ForCatalog!]!`,
      config: (entityConfig2, generalConfig2) =>
        composeDerivativeConfigByName('ForCatalog', entityConfig2, generalConfig2),
    };

    const result2 = composeActionSignature(result, sortEntityConfig, generalConfig);

    const expectedResult2 = composeActionSignature(expectedResult, sortEntityConfig, generalConfig);

    expect(result2).toEqual(expectedResult2);
  });

  test('should return inputs for "paginationEntityConfig"', () => {
    const expectedResult = {
      name: 'entitiesForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('entities')
          ? `${pluralize(name)}ForCatalog`
          : '',
      argNames: () => ['where', 'sort', 'pagination'],
      argTypes: ({ name }) => [
        `${name}ForCatalogWhereInput`,
        `${name}ForCatalogSortInput`,
        'PaginationInput',
      ],
      type: ({ name }) => `[${name}ForCatalog!]!`,
      config: (entityConfig2, generalConfig2) =>
        composeDerivativeConfigByName('ForCatalog', entityConfig2, generalConfig2),
    };

    const result2 = composeActionSignature(result, paginationEntityConfig, generalConfig);

    const expectedResult2 = composeActionSignature(
      expectedResult,
      paginationEntityConfig,
      generalConfig,
    );

    expect(result2).toEqual(expectedResult2);
  });

  test('should return inputs for "nearEntityConfig"', () => {
    const expectedResult = {
      name: 'entitiesForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('entities')
          ? `${pluralize(name)}ForCatalog`
          : '',
      argNames: () => ['where', 'sort', 'pagination', 'near'],
      argTypes: ({ name }) => [
        `${name}ForCatalogWhereInput`,
        `${name}ForCatalogSortInput`,
        'PaginationInput',
        `${name}ForCatalogNearInput`,
      ],
      type: ({ name }) => `[${name}ForCatalog!]!`,
      config: (entityConfig2, generalConfig2) =>
        composeDerivativeConfigByName('ForCatalog', entityConfig2, generalConfig2),
    };

    const result2 = composeActionSignature(result, nearEntityConfig, generalConfig);

    const expectedResult2 = composeActionSignature(expectedResult, nearEntityConfig, generalConfig);

    expect(result2).toEqual(expectedResult2);
  });
});
