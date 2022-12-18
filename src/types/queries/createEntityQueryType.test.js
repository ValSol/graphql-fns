// @flow
/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import entityQueryAttributes from '../actionAttributes/entityQueryAttributes';
import composeActionSignature from '../composeActionSignature';

describe('createEntityQueryType', () => {
  test('should create query only entity type', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
    };

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Example: entityConfig },
    };

    const expectedResult = '  Example(whereOne: ExampleWhereOneInput!): Example!';

    const entityTypeDic = {};

    const inputDic = {};

    const result = composeActionSignature(
      entityConfig,
      generalConfig,
      entityQueryAttributes,
      entityTypeDic,
      inputDic,
    );
    expect(result).toEqual(expectedResult);
  });
});
