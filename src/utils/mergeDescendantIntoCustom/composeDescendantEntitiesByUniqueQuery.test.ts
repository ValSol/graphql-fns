/* eslint-env jest */

import pluralize from 'pluralize';

import type { DescendantAttributes, GeneralConfig, EntityConfig } from '../../tsTypes';

import entitiesByUniqueQueryAttributes from '../../types/actionAttributes/entitiesByUniqueQueryAttributes';
import composeDescendantConfigByName from '../composeDescendantConfigByName';
import composeCustomActionSignature from '../../types/composeCustomActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeDescendantEntitiesQuery', () => {
  const entityConfig: EntityConfig = {
    name: 'Example',
    type: 'tangible',
    textFields: [
      {
        name: 'textField',
        type: 'textFields',
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
        type: 'textFields',
      },
    ],
  };

  const paginationEntityConfig: EntityConfig = {
    name: 'PaginationExample',
    type: 'tangible',
    textFields: [
      {
        name: 'textField',
        type: 'textFields',
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
        type: 'geospatialFields',
      },
    ],
  };

  const addedFields = {
    floatFields: [{ name: 'floatField' }],
  };
  const ForCatalog: DescendantAttributes = {
    allow: {
      Example: ['entity', 'entitiesByUnique'],
      SortExample: ['entity', 'entitiesByUnique'],
      PaginationExample: ['entity', 'entitiesByUnique'],
      NearExample: ['entity', 'entitiesByUnique'],
    },

    descendantKey: 'ForCatalog',
    addFields: {
      Example: addedFields,
      SortExample: addedFields,
      PaginationExample: addedFields,
      NearExample: addedFields,
    },
  };

  const descendant = { ForCatalog };

  const generalConfig: GeneralConfig = {
    allEntityConfigs: {
      Example: entityConfig,
      SortExample: sortEntityConfig,
      PaginationExample: paginationEntityConfig,
      NearExample: nearEntityConfig,
    },
    descendant,
  };

  const result = composeCustomAction(ForCatalog, entitiesByUniqueQueryAttributes);

  test('should return inputs for "entityConfig"', () => {
    const expectedResult = {
      name: 'entitiesByUniqueForCatalog',
      specificName: ({ name }: any) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('entitiesByUnique')
          ? `${pluralize(name)}ByUniqueForCatalog`
          : '',
      argNames: () => ['where', 'sort'],
      argTypes: ({ name }: any) => [
        `${name}ForCatalogWhereByUniqueInput!`,
        `${name}ForCatalogSortInput`,
      ],
      involvedEntityNames: ({ name }: any) => ({ inputOutputEntity: `${name}ForCatalog` }),
      type: ({ name }: any) => `[${name}ForCatalog!]!`,
      config: (entityConfig2: any, generalConfig2: any) =>
        composeDescendantConfigByName('ForCatalog', entityConfig2, generalConfig2),
    };

    const result2 = composeCustomActionSignature(result, entityConfig, generalConfig);

    const expectedResult2 = composeCustomActionSignature(
      expectedResult,
      entityConfig,
      generalConfig,
    );

    expect(result2).toEqual(expectedResult2);

    expect(result.involvedEntityNames(entityConfig, generalConfig)).toEqual(
      expectedResult.involvedEntityNames(entityConfig),
    );

    expect(result.config(entityConfig, generalConfig)).toEqual(
      expectedResult.config(entityConfig, generalConfig),
    );
  });

  test('should return inputs for "sortEntityConfig"', () => {
    const expectedResult = {
      name: 'entitiesByUniqueForCatalog',
      specificName: ({ name }: any) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('entitiesByUnique')
          ? `${pluralize(name)}ByUniqueForCatalog`
          : '',
      argNames: () => ['where', 'sort'],
      argTypes: ({ name }: any) => [
        `${name}ForCatalogWhereByUniqueInput!`,
        `${name}ForCatalogSortInput`,
      ],
      involvedEntityNames: ({ name }: any) => ({ inputOutputEntity: `${name}ForCatalog` }),
      type: ({ name }: any) => `[${name}ForCatalog!]!`,
      config: (entityConfig2: any, generalConfig2: any) =>
        composeDescendantConfigByName('ForCatalog', entityConfig2, generalConfig2),
    };

    const result2 = composeCustomActionSignature(result, sortEntityConfig, generalConfig);

    const expectedResult2 = composeCustomActionSignature(
      expectedResult,
      sortEntityConfig,
      generalConfig,
    );

    expect(result2).toEqual(expectedResult2);

    expect(result.involvedEntityNames(entityConfig, generalConfig)).toEqual(
      expectedResult.involvedEntityNames(entityConfig),
    );

    expect(result.config(entityConfig, generalConfig)).toEqual(
      expectedResult.config(entityConfig, generalConfig),
    );
  });

  test('should return inputs for "paginationEntityConfig"', () => {
    const expectedResult = {
      name: 'entitiesByUniqueForCatalog',
      specificName: ({ name }: any) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('entitiesByUnique')
          ? `${pluralize(name)}ByUniqueForCatalog`
          : '',
      argNames: () => ['where', 'sort'],
      argTypes: ({ name }: any) => [
        `${name}ForCatalogWhereByUniqueInput!`,
        `${name}ForCatalogSortInput`,
      ],
      involvedEntityNames: ({ name }: any) => ({ inputOutputEntity: `${name}ForCatalog` }),
      type: ({ name }: any) => `[${name}ForCatalog!]!`,
      config: (entityConfig2: any, generalConfig2: any) =>
        composeDescendantConfigByName('ForCatalog', entityConfig2, generalConfig2),
    };

    const result2 = composeCustomActionSignature(result, paginationEntityConfig, generalConfig);

    const expectedResult2 = composeCustomActionSignature(
      expectedResult,
      paginationEntityConfig,
      generalConfig,
    );

    expect(result2).toEqual(expectedResult2);

    expect(result.involvedEntityNames(entityConfig, generalConfig)).toEqual(
      expectedResult.involvedEntityNames(entityConfig),
    );

    expect(result.config(entityConfig, generalConfig)).toEqual(
      expectedResult.config(entityConfig, generalConfig),
    );
  });

  test('should return inputs for "nearEntityConfig"', () => {
    const expectedResult = {
      name: 'entitiesByUniqueForCatalog',
      specificName: ({ name }: any) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('entitiesByUnique')
          ? `${pluralize(name)}ByUniqueForCatalog`
          : '',
      argNames: () => ['where', 'sort', 'near'],
      argTypes: ({ name }: any) => [
        `${name}ForCatalogWhereByUniqueInput!`,
        `${name}ForCatalogSortInput`,
        `${name}ForCatalogNearInput`,
      ],
      involvedEntityNames: ({ name }: any) => ({ inputOutputEntity: `${name}ForCatalog` }),
      type: ({ name }: any) => `[${name}ForCatalog!]!`,
      config: (entityConfig2: any, generalConfig2: any) =>
        composeDescendantConfigByName('ForCatalog', entityConfig2, generalConfig2),
    };

    const result2 = composeCustomActionSignature(result, nearEntityConfig, generalConfig);

    const expectedResult2 = composeCustomActionSignature(
      expectedResult,
      nearEntityConfig,
      generalConfig,
    );

    expect(result2).toEqual(expectedResult2);

    expect(result.involvedEntityNames(entityConfig, generalConfig)).toEqual(
      expectedResult.involvedEntityNames(entityConfig),
    );

    expect(result.config(entityConfig, generalConfig)).toEqual(
      expectedResult.config(entityConfig, generalConfig),
    );
  });
});
