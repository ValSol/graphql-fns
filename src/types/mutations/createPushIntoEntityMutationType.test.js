// @flow
/* eslint-env jest */

import type { EntityConfig } from '../../flowTypes';

import pushIntoEntityMutationAttributes from '../actionAttributes/pushIntoEntityMutationAttributes';
import composeStandardActionSignature from '../composeStandardActionSignature';

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
    const expectedResult =
      '  pushIntoExample(whereOne: ExampleWhereOneInput!, data: PushIntoExampleInput!, positions: ExamplePushPositionsInput): Example!';
    const dic = {};

    const result = composeStandardActionSignature(
      entityConfig,
      pushIntoEntityMutationAttributes,
      dic,
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
    const expectedResult = '';
    const dic = {};

    const result = composeStandardActionSignature(
      entityConfig,
      pushIntoEntityMutationAttributes,
      dic,
    );
    expect(result).toEqual(expectedResult);
  });
});
