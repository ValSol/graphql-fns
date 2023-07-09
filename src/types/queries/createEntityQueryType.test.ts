/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../tsTypes';

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

    const expectedResult = '  Example(whereOne: ExampleWhereOneInput!, token: String): Example!';

    const entityTypeDic: { [entityName: string]: string } = {};

    const inputDic: { [inputName: string]: string } = {};

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
