/* eslint-env jest */

import type {EntityConfig, GeneralConfig} from '../../tsTypes';

import entitiesByUniqueQueryAttributes from '../../types/actionAttributes/entitiesByUniqueQueryAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeEntitiesQueryArgs', () => {
  const prefixName = 'Home';
  test('should compose entities query with default args', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const generalConfig: GeneralConfig = { allEntityConfigs: { Example: entityConfig } };

    const expectedResult = [
      'query Home_ExamplesByUnique($where: ExampleWhereByUniqueInput!, $sort: ExampleSortInput) {',
      '  ExamplesByUnique(where: $where, sort: $sort) {',
    ];

    const result = composeActionArgs(
      prefixName,
      entityConfig,
      generalConfig,
      entitiesByUniqueQueryAttributes,
      {},
    );
    expect(result).toEqual(expectedResult);
  });

  test('should compose entities query with ExampleWhereByUniqueInput and ExampleSortInput args', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };

    const generalConfig: GeneralConfig = { allEntityConfigs: { Example: entityConfig } };

    const expectedResult = [
      'query Home_ExamplesByUnique($where: ExampleWhereByUniqueInput!, $sort: ExampleSortInput) {',
      '  ExamplesByUnique(where: $where, sort: $sort) {',
    ];

    const result = composeActionArgs(
      prefixName,
      entityConfig,
      generalConfig,
      entitiesByUniqueQueryAttributes,
      {},
    );
    expect(result).toEqual(expectedResult);
  });

  test('should compose entities query with PaginationInput args', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const generalConfig: GeneralConfig = { allEntityConfigs: { Example: entityConfig } };

    const expectedResult = [
      'query Home_ExamplesByUnique($where: ExampleWhereByUniqueInput!, $sort: ExampleSortInput) {',
      '  ExamplesByUnique(where: $where, sort: $sort) {',
    ];

    const result = composeActionArgs(
      prefixName,
      entityConfig,
      generalConfig,
      entitiesByUniqueQueryAttributes,
      {},
    );
    expect(result).toEqual(expectedResult);
  });

  test('should compose entities query with ExampleNearInput args', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      geospatialFields: [
        {
          name: 'position',
          geospatialType: 'Point',
        },
      ],
    };

    const generalConfig: GeneralConfig = { allEntityConfigs: { Example: entityConfig } };

    const expectedResult = [
      'query Home_ExamplesByUnique($where: ExampleWhereByUniqueInput!, $sort: ExampleSortInput, $near: ExampleNearInput) {',
      '  ExamplesByUnique(where: $where, sort: $sort, near: $near) {',
    ];

    const result = composeActionArgs(
      prefixName,
      entityConfig,
      generalConfig,
      entitiesByUniqueQueryAttributes,
      {},
    );
    expect(result).toEqual(expectedResult);
  });
});
