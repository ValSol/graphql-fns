// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import createPushIntoThingMutationType from './createPushIntoThingMutationType';

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
      '  pushExample(whereOne: ExampleWhereOneInput!, data: PushIntoExampleInput!): Example!';

    const result = createPushIntoThingMutationType(thingConfig);
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

    const result = createPushIntoThingMutationType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
