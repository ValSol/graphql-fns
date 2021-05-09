// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import pushIntoThingMutationAttributes from '../actionAttributes/pushIntoThingMutationAttributes';
import composeStandardActionSignature from '../composeStandardActionSignature';

describe('createPushIntoThingMutationType', () => {
  test('should push mutation add thing type', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
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
      thingConfig,
      pushIntoThingMutationAttributes,
      dic,
    );
    expect(result).toEqual(expectedResult);
  });

  test('should push mutation add thing type', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
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
      thingConfig,
      pushIntoThingMutationAttributes,
      dic,
    );
    expect(result).toEqual(expectedResult);
  });
});
