import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import entityExistencesQueryAttributes from '../actionAttributes/entityExistencesQueryAttributes';
import composeActionSignature from '../composeActionSignature';

describe('createEntityExistencesQueryType', () => {
  test('should create query entity existences type', () => {
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
      '  ExampleExistences(whereAndSearch: [ExampleWhereAndSearchInput!]!, token: String): [Boolean!]!';

    const entityTypeDic: { [entityName: string]: string } = {};

    const inputDic: { [inputName: string]: string } = {};

    const result = composeActionSignature(
      entityConfig,
      generalConfig,
      entityExistencesQueryAttributes,
      entityTypeDic,
      inputDic,
    );
    expect(result).toEqual(expectedResult);

    expect(Object.keys(inputDic)).toEqual(['ExampleWhereAndSearchInput', 'ExampleWhereInput']);
  });

  test('should create query entity existences type with search field', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          weight: 1,
          type: 'textFields',
        },
      ],
    };

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Example: entityConfig },
    };

    const expectedResult =
      '  ExampleExistences(whereAndSearch: [ExampleWhereAndSearchInput!]!, token: String): [Boolean!]!';

    const inputDic: { [inputName: string]: string } = {};

    const result = composeActionSignature(
      entityConfig,
      generalConfig,
      entityExistencesQueryAttributes,
      {},
      inputDic,
    );
    expect(result).toEqual(expectedResult);

    expect(inputDic.ExampleWhereAndSearchInput).toBe(`input ExampleWhereAndSearchInput {
  where: ExampleWhereInput = {}
  search: String
}`);
  });
});
