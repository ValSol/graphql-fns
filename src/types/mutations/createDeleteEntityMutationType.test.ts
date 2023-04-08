/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../tsTypes';

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

    const entityTypeDic: { [entityName: string]: string } = {};

    const inputDic: { [inputName: string]: string } = {};

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
