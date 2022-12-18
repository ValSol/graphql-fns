// @flow
/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import deleteEntityMutationAttributes from '../actionAttributes/deleteEntityMutationAttributes';
import composeActionSignature from '../composeActionSignature';

describe('createDeleteEntityMutationType', () => {
  test('should create mutation delete entity type', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
    };

    const generalConfig: GeneralConfig = { allEntityConfigs: { Example: entityConfig } };

    const expectedResult = '  deleteExample(whereOne: ExampleWhereOneInput!): Example!';

    const entityTypeDic = {};

    const inputDic = {};

    const result = composeActionSignature(
      entityConfig,
      generalConfig,
      deleteEntityMutationAttributes,
      entityTypeDic,
      inputDic,
    );
    expect(result).toEqual(expectedResult);
  });
});
