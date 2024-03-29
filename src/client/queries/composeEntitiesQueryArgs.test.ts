/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import entitiesQueryAttributes from '../../types/actionAttributes/entitiesQueryAttributes';
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
          type: 'textFields',
        },
      ],
    };

    const generalConfig: GeneralConfig = { allEntityConfigs: { Example: entityConfig } };

    const expectedResult = [
      'query Home_Examples($where: ExampleWhereInput, $sort: ExampleSortInput, $pagination: PaginationInput, $token: String) {',
      '  Examples(where: $where, sort: $sort, pagination: $pagination, token: $token) {',
    ];

    const result = composeActionArgs(
      prefixName,
      entityConfig,
      generalConfig,
      entitiesQueryAttributes,
      {},
    );
    expect(result).toEqual(expectedResult);
  });

  test('should compose entities query with ExampleWhereInput and ExampleSortInput args', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
          type: 'textFields',
        },
      ],
    };

    const generalConfig: GeneralConfig = { allEntityConfigs: { Example: entityConfig } };

    const expectedResult = [
      'query Home_Examples($where: ExampleWhereInput, $sort: ExampleSortInput, $pagination: PaginationInput, $token: String) {',
      '  Examples(where: $where, sort: $sort, pagination: $pagination, token: $token) {',
    ];

    const result = composeActionArgs(
      prefixName,
      entityConfig,
      generalConfig,
      entitiesQueryAttributes,
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
          type: 'textFields',
        },
      ],
    };

    const generalConfig: GeneralConfig = { allEntityConfigs: { Example: entityConfig } };

    const expectedResult = [
      'query Home_Examples($where: ExampleWhereInput, $sort: ExampleSortInput, $pagination: PaginationInput, $token: String) {',
      '  Examples(where: $where, sort: $sort, pagination: $pagination, token: $token) {',
    ];

    const result = composeActionArgs(
      prefixName,
      entityConfig,
      generalConfig,
      entitiesQueryAttributes,
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
          type: 'geospatialFields',
        },
      ],
    };

    const generalConfig: GeneralConfig = { allEntityConfigs: { Example: entityConfig } };

    const expectedResult = [
      'query Home_Examples($where: ExampleWhereInput, $sort: ExampleSortInput, $pagination: PaginationInput, $near: ExampleNearInput, $token: String) {',
      '  Examples(where: $where, sort: $sort, pagination: $pagination, near: $near, token: $token) {',
    ];

    const result = composeActionArgs(
      prefixName,
      entityConfig,
      generalConfig,
      entitiesQueryAttributes,
      {},
    );
    expect(result).toEqual(expectedResult);
  });
});
