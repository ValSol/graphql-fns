import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import entityManyDistinctValuesQueryAttributes from '../actionAttributes/entityManyDistinctValuesQueryAttributes';
import composeActionSignature from '../composeActionSignature';

describe('createEntityManyDistinctValuesQueryType', () => {
  test('should create query entity many distinct values type', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          index: true,
          type: 'textFields',
        },
      ],
    };

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Example: entityConfig },
    };

    const expectedResult =
      '  ExampleManyDistinctValues(where: ExampleWhereInput, restrictedWhereAndTarget: [ExampleRestrictedWhereAndTargetInput!]!, token: String): [[String!]!]!';

    const entityTypeDic: { [entityName: string]: string } = {};

    const inputDic: { [inputName: string]: string } = {};

    const result = composeActionSignature(
      entityConfig,
      generalConfig,
      entityManyDistinctValuesQueryAttributes,
      entityTypeDic,
      inputDic,
    );
    expect(result).toEqual(expectedResult);

    expect(Object.keys(inputDic)).toEqual([
      'ExampleWhereInput',
      'ExampleRestrictedWhereAndTargetInput',
      'ExampleTextNamesEnum',
      'ExampleRestrictedWhereInput',
    ]);
  });

  test('should create query entity many distinct values type with search arg', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          index: true,
          weight: 1,
          type: 'textFields',
        },
      ],
    };

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Example: entityConfig },
    };

    const expectedResult =
      '  ExampleManyDistinctValues(where: ExampleWhereInput, restrictedWhereAndTarget: [ExampleRestrictedWhereAndTargetInput!]!, search: String, token: String): [[String!]!]!';

    const result = composeActionSignature(
      entityConfig,
      generalConfig,
      entityManyDistinctValuesQueryAttributes,
      {},
      {},
    );
    expect(result).toEqual(expectedResult);
  });

  test('should not create query for entity without targets', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          type: 'textFields',
        },
      ],
    };

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Example: entityConfig },
    };

    const result = composeActionSignature(
      entityConfig,
      generalConfig,
      entityManyDistinctValuesQueryAttributes,
      {},
      {},
    );
    expect(result).toBe('');
  });
});
