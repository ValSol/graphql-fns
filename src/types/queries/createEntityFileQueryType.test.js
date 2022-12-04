// @flow
/* eslint-env jest */

import type { EntityConfig } from '../../flowTypes';

import entityFileQueryAttributes from '../actionAttributes/entityFileQueryAttributes';
import composeStandardActionSignature from '../composeStandardActionSignature';

describe('createEntityFileQueryType', () => {
  test('should create query', () => {
    const entityConfig: EntityConfig = {
      name: 'TangibleExample',
      type: 'tangibleFile',
    };
    const expectedResult = '  TangibleExampleFile(whereOne: FileWhereOneInput!): TangibleExample!';
    const dic = {};

    const result = composeStandardActionSignature(entityConfig, entityFileQueryAttributes, dic);
    expect(result).toEqual(expectedResult);
  });

  test('should create empty query', () => {
    const entityConfig: EntityConfig = {
      name: 'TangibleExample',
      type: 'tangible',
    };
    const expectedResult = '';
    const dic = {};

    const result = composeStandardActionSignature(entityConfig, entityFileQueryAttributes, dic);
    expect(result).toEqual(expectedResult);
  });
});
