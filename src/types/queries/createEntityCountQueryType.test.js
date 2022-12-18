// @flow
/* eslint-env jest */
import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import entityCountQueryAttributes from '../actionAttributes/entityCountQueryAttributes';
import composeActionSignature from '../composeActionSignature';

describe('createEntityCountQueryType', () => {
  test('should create query entities type without index fields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
        },
        {
          name: 'lastName',
        },
      ],
    };

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Example: entityConfig },
    };

    const expectedResult = '  ExampleCount(where: ExampleWhereInput): Int!';

    const entityTypeDic = {};

    const inputDic = {};

    const result = composeActionSignature(
      entityConfig,
      generalConfig,
      entityCountQueryAttributes,
      entityTypeDic,
      inputDic,
    );
    expect(result).toEqual(expectedResult);
  });

  test('should create query entities type with where arg', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          index: true,
        },
        {
          name: 'lastName',
          index: true,
        },
      ],
    };

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Example: entityConfig },
    };

    const expectedResult = '  ExampleCount(where: ExampleWhereInput): Int!';

    const entityTypeDic = {};

    const inputDic = {};

    const result = composeActionSignature(
      entityConfig,
      generalConfig,
      entityCountQueryAttributes,
      entityTypeDic,
      inputDic,
    );
    expect(result).toEqual(expectedResult);
  });
});
