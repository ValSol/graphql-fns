// @flow
/* eslint-env jest */

import type { DerivativeAttributes, GeneralConfig, EntityConfig } from '../../flowTypes';

import entityCountQueryAttributes from '../../types/actionAttributes/entityCountQueryAttributes';
import composeActionSignature from '../../types/composeActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeDerivativeEntityCountQuery', () => {
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
      Example: ['entityCount', 'entities'],
      SortExample: ['entityCount', 'entities'],
      PaginationExample: ['entityCount', 'entities'],
      NearExample: ['entityCount', 'entities'],
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

  const result = composeCustomAction(ForCatalog, entityCountQueryAttributes);

  test('should return inputs for "entityConfig"', () => {
    const expectedResult = {
      name: 'entityCountForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('entityCount')
          ? `${name}CountForCatalog`
          : '',
      argNames: () => ['where'],
      argTypes: ({ name }) => [`${name}ForCatalogWhereInput`],
      type: () => 'Int!',
      config: () => null,
    };

    const result2 = composeActionSignature(result, entityConfig, generalConfig);

    const expectedResult2 = composeActionSignature(expectedResult, entityConfig, generalConfig);

    expect(result2).toEqual(expectedResult2);
  });

  test('should return inputs for "sortEntityConfig"', () => {
    const expectedResult = {
      name: 'entityCountForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('entityCount')
          ? `${name}CountForCatalog`
          : '',
      argNames: () => ['where'],
      argTypes: ({ name }) => [`${name}ForCatalogWhereInput`],
      type: () => 'Int!',
      config: () => null,
    };

    const result2 = composeActionSignature(result, sortEntityConfig, generalConfig);

    const expectedResult2 = composeActionSignature(expectedResult, sortEntityConfig, generalConfig);

    expect(result2).toEqual(expectedResult2);
  });

  test('should return inputs for "paginationEntityConfig"', () => {
    const expectedResult = {
      name: 'entityCountForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('entityCount')
          ? `${name}CountForCatalog`
          : '',
      argNames: () => ['where'],
      argTypes: ({ name }) => [`${name}ForCatalogWhereInput`],
      type: () => 'Int!',
      config: () => null,
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
      name: 'entityCountForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('entityCount')
          ? `${name}CountForCatalog`
          : '',
      argNames: () => ['where', 'near'],
      argTypes: ({ name }) => [`${name}ForCatalogWhereInput`, `${name}ForCatalogNearInput`],
      type: () => 'Int!',
      config: () => null,
    };

    const result2 = composeActionSignature(result, nearEntityConfig, generalConfig);

    const expectedResult2 = composeActionSignature(expectedResult, nearEntityConfig, generalConfig);
    expect(result2).toEqual(expectedResult2);
  });
});
