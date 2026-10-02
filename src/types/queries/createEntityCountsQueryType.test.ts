import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import entityCountsQueryAttributes from '../actionAttributes/entityCountsQueryAttributes';
import composeActionSignature from '../composeActionSignature';

describe('createEntityCountsQueryType', () => {
  test('should create query entity counts type', () => {
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
      '  ExampleCounts(where: ExampleWhereInput, restrictedWhere: [ExampleRestrictedWhereInput!]!, token: String): [Int!]!';

    const entityTypeDic: { [entityName: string]: string } = {};

    const inputDic: { [inputName: string]: string } = {};

    const result = composeActionSignature(
      entityConfig,
      generalConfig,
      entityCountsQueryAttributes,
      entityTypeDic,
      inputDic,
    );
    expect(result).toEqual(expectedResult);

    expect(Object.keys(inputDic)).toEqual(['ExampleWhereInput', 'ExampleRestrictedWhereInput']);
  });

  test('should create query entity counts type with search arg', () => {
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
      '  ExampleCounts(where: ExampleWhereInput, restrictedWhere: [ExampleRestrictedWhereInput!]!, search: String, token: String): [Int!]!';

    const result = composeActionSignature(
      entityConfig,
      generalConfig,
      entityCountsQueryAttributes,
      {},
      {},
    );
    expect(result).toEqual(expectedResult);
  });
});
