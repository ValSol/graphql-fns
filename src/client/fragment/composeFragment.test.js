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
    const fragmentName = 'firstExample';
    const result = composeFragment(fragmentName, thingConfig);
    const expectedResult = `fragment firstExample on Example {
  id
  createdAt
  updatedAt
  textField
}`;

    expect(result).toBe(expectedResult);
  });
});
