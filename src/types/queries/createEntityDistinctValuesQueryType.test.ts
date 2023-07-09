/* eslint-env jest */
import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import entityDistinctValuesQueryAttributes from '../actionAttributes/entityDistinctValuesQueryAttributes';
import composeActionSignature from '../composeActionSignature';

describe('createEntityDistinctValuesQueryType', () => {
  test('should return empty string if there is not textFields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      floatFields: [
        {
          name: 'firstName',
          type: 'floatFields',
        },
        {
          name: 'lastName',
          type: 'floatFields',
        },
      ],
    };

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Example: entityConfig },
    };

    const expectedResult = '';

    const entityTypeDic: { [entityName: string]: string } = {};

    const inputDic: { [inputName: string]: string } = {};

    const result = composeActionSignature(
      entityConfig,
      generalConfig,
      entityDistinctValuesQueryAttributes,
      entityTypeDic,
      inputDic,
    );
    expect(result).toEqual(expectedResult);
  });

  test('should create query', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          type: 'textFields',
        },
        {
          name: 'textFieldArray',
          array: true,
          type: 'textFields',
        },
      ],
    };

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Example: entityConfig },
    };

    const expectedResult =
      '  ExampleDistinctValues(where: ExampleWhereInput, options: ExampleDistinctValuesOptionsInput, token: String): [String!]!';

    const entityTypeDic: { [entityName: string]: string } = {};

    const inputDic: { [inputName: string]: string } = {};

    const result = composeActionSignature(
      entityConfig,
      generalConfig,
      entityDistinctValuesQueryAttributes,
      entityTypeDic,
      inputDic,
    );
    expect(result).toEqual(expectedResult);
  });
});
