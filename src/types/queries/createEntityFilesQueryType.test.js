// @flow
/* eslint-env jest */

import type { EntityConfig } from '../../flowTypes';

import entityFilesQueryAttributes from '../actionAttributes/entityFilesQueryAttributes';
import composeStandardActionSignature from '../composeStandardActionSignature';

describe('createEntityFilesQueryType', () => {
  test('should create query only entity type', () => {
    const entityConfig: EntityConfig = {
      name: 'TangibleExample',
      type: 'tangibleFile',
    };
    const expectedResult = '  TangibleExampleFiles(where: FileWhereInput): [TangibleExample!]!';
    const dic = {};

    const result = composeStandardActionSignature(entityConfig, entityFilesQueryAttributes, dic);
    expect(result).toEqual(expectedResult);
  });
});
