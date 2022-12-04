// @flow
/* eslint-env jest */

import pluralize from 'pluralize';

import type { DerivativeAttributes, GeneralConfig, EntityConfig } from '../../flowTypes';

import entitiesByUniqueQueryAttributes from '../../types/actionAttributes/entitiesByUniqueQueryAttributes';
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
      Example: ['entity', 'entitiesByUnique'],
      SortExample: ['entity', 'entitiesByUnique'],
      PaginationExample: ['entity', 'entitiesByUnique'],
      NearExample: ['entity', 'entitiesByUnique'],
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
    entityConfigs: {
      Example: entityConfig,
      SortExample: sortEntityConfig,
      PaginationExample: paginationEntityConfig,
      NearExample: nearEntityConfig,
    },
    derivative,
  };

  const result = composeCustomAction(ForCatalog, entitiesByUniqueQueryAttributes);

  test('should return inputs for "entityConfig"', () => {
    const expectedResult = {
      name: 'entitiesByUniqueForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('entitiesByUnique')
          ? `${pluralize(name)}ByUniqueForCatalog`
          : '',
      argNames: () => ['where', 'sort'],
      argTypes: ({ name }) => [
        `${name}ForCatalogWhereByUniqueInput!`,
        `${name}ForCatalogSortInput`,
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
      name: 'entitiesByUniqueForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('entitiesByUnique')
          ? `${pluralize(name)}ByUniqueForCatalog`
          : '',
      argNames: () => ['where', 'sort'],
      argTypes: ({ name }) => [
        `${name}ForCatalogWhereByUniqueInput!`,
        `${name}ForCatalogSortInput`,
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
      name: 'entitiesByUniqueForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('entitiesByUnique')
          ? `${pluralize(name)}ByUniqueForCatalog`
          : '',
      argNames: () => ['where', 'sort'],
      argTypes: ({ name }) => [
        `${name}ForCatalogWhereByUniqueInput!`,
        `${name}ForCatalogSortInput`,
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
      name: 'entitiesByUniqueForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('entitiesByUnique')
          ? `${pluralize(name)}ByUniqueForCatalog`
          : '',
      argNames: () => ['where', 'sort', 'near'],
      argTypes: ({ name }) => [
        `${name}ForCatalogWhereByUniqueInput!`,
        `${name}ForCatalogSortInput`,
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