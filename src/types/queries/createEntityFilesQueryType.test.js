// @flow
/* eslint-env jest */

import type { EntityConfig } from '../../flowTypes';

import entityFilesQueryAttributes from '../actionAttributes/entityFilesQueryAttributes';
import composeStandardActionSignature from '../composeStandardActionSignature';

describe('createEntityFilesQueryType', () => {
  test('should create query only entity type', () => {
    const entityConfig: EntityConfig = {
      name: 'RootExample',
      type: 'tangibleFile',
    };
    const expectedResult = '  RootExampleFiles(where: FileWhereInput): [RootExample!]!';
    const dic = {};

    const result = composeStandardActionSignature(entityConfig, entityFilesQueryAttributes, dic);
    expect(result).toEqual(expectedResult);
  });
});
