// @flow
/* eslint-env jest */

import type { EntityConfig } from '../../flowTypes';

import entityFileCountQueryAttributes from '../actionAttributes/entityFileCountQueryAttributes';
import composeStandardActionSignature from '../composeStandardActionSignature';

describe('createEntityFileCountQueryType', () => {
  test('should create query', () => {
    const entityConfig: EntityConfig = {
      name: 'RootExample',
      type: 'tangibleFile',
    };
    const expectedResult = '  RootExampleFileCount(where: FileWhereInput): Int!';
    const dic = {};

    const result = composeStandardActionSignature(
      entityConfig,
      entityFileCountQueryAttributes,
      dic,
    );
    expect(result).toEqual(expectedResult);
  });

  test('should create empty query', () => {
    const entityConfig: EntityConfig = {
      name: 'RootExample',
      type: 'tangible',
    };
    const expectedResult = '';
    const dic = {};

    const result = composeStandardActionSignature(
      entityConfig,
      entityFileCountQueryAttributes,
      dic,
    );
    expect(result).toEqual(expectedResult);
  });
});
