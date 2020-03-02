// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeFragment from './composeFragment';

describe('composeFragment', () => {
  const thingConfig: ThingConfig = {
    name: 'Example',
    textFields: [
      {
        name: 'textField',
        index: true,
      },
    ],
  };

  test('should compose fragment', () => {
    const expectedResult = `fragment myExample on Example {
  id
  createdAt
  updatedAt
  textField
}`;

    const result = composeFragment(thingConfig);
    expect(result).toBe(expectedResult);
  });
});
