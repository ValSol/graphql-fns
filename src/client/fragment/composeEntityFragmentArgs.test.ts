/* eslint-env jest */

import type { EntityConfig } from '../../tsTypes';

import composeEntityFragmentArgs from './composeEntityFragmentArgs';

describe('composeEntityFragmentArgs', () => {
  test('should compose entity query args ', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          type: 'textFields',
        },
      ],
    };

    const fragmentName = 'firstExample';
    const result = composeEntityFragmentArgs(fragmentName, entityConfig);

    const expectedResult = ['fragment firstExample on Example {'];

    expect(result).toEqual(expectedResult);
  });
});
