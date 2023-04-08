/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import pushIntoEntityMutationAttributes from '../actionAttributes/pushIntoEntityMutationAttributes';
import composeActionSignature from '../composeActionSignature';

describe('createPushIntoEntityMutationType', () => {
  test('should push mutation add entity type', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField1',
        },
        {
          name: 'textField2',
          default: 'default text',
        },
        {
          name: 'textField3',
          required: true,
        },
        {
          name: 'textField4',
          array: true,
        },
        {
          name: 'textField5',
          default: ['default text'],
          required: true,
          array: true,
        },
      ],
    };

    const generalConfig: GeneralConfig = { allEntityConfigs: { Example: entityConfig } };

    const expectedResult =
      '  pushIntoExample(whereOne: ExampleWhereOneInput!, data: PushIntoExampleInput!, positions: ExamplePushPositionsInput): Example!';

    const entityTypeDic: { [entityName: string]: string } = {};

    const inputDic: { [inputName: string]: string } = {};

    const result = composeActionSignature(
      entityConfig,
      generalConfig,
      pushIntoEntityMutationAttributes,
      entityTypeDic,
      inputDic,
    );
    expect(result).toEqual(expectedResult);
  });

  test('should push mutation add entity type', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField1',
        },
        {
          name: 'textField2',
          default: 'default text',
        },
        {
          name: 'textField3',
          required: true,
        },
      ],
    };
    const generalConfig: GeneralConfig = { allEntityConfigs: { Example: entityConfig } };

    const expectedResult = '';

    const entityTypeDic: { [entityName: string]: string } = {};

    const inputDic: { [inputName: string]: string } = {};

    const result = composeActionSignature(
      entityConfig,
      generalConfig,
      pushIntoEntityMutationAttributes,
      entityTypeDic,
      inputDic,
    );
    expect(result).toEqual(expectedResult);
  });
});
