// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import createConcatenateThingMutationType from './createConcatenateThingMutationType';

describe('createConcatenateThingMutationType', () => {
  test('should concatenate mutation add thing type', () => {
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
      '  concatenateExample(whereOne: ExampleWhereOneInput!, data: ExampleConcatenateInput!): Example!';

    const result = createConcatenateThingMutationType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should concatenate mutation add thing type', () => {
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

    const result = createConcatenateThingMutationType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
