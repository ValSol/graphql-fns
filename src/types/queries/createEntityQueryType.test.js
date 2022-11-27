// @flow
/* eslint-env jest */

import type { EntityConfig } from '../../flowTypes';

import entityQueryAttributes from '../actionAttributes/entityQueryAttributes';
import composeStandardActionSignature from '../composeStandardActionSignature';

describe('createEntityQueryType', () => {
  test('should create query only entity type', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
    };
    const expectedResult = '  Example(whereOne: ExampleWhereOneInput!): Example!';
    const dic = {};

    const result = composeStandardActionSignature(entityConfig, entityQueryAttributes, dic);
    expect(result).toEqual(expectedResult);
  });
});
