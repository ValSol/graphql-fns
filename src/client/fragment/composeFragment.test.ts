/* eslint-env jest */

import type { TangibleEntityConfig } from '../../tsTypes';

import composeFragment from './composeFragment';

describe('composeFragment', () => {
  const entityConfig: TangibleEntityConfig = {
    name: 'Example',
    type: 'tangible',
    textFields: [
      {
        name: 'textField',
        index: true,
        type: 'textFields',
      },
    ],
  };

  const generalConfig = { allEntityConfigs: { Example: entityConfig } };

  test('should compose fragment', () => {
    const fragmentName = 'firstExample';
    const result = composeFragment(fragmentName, entityConfig, generalConfig);
    const expectedResult = `fragment firstExample on Example {
  id
  createdAt
  updatedAt
  textField
}`;

    expect(result).toBe(expectedResult);
  });
});
