// @flow
/* eslint-env jest */

import type { EntityConfig } from '../../flowTypes';

import composeEntityFragmentArgs from './composeEntityFragmentArgs';

describe('composeEntityFragmentArgs', () => {
  test('should compose entity query args ', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const fragmentName = 'firstExample';
    const result = composeEntityFragmentArgs(fragmentName, entityConfig);

    const expectedResult = ['fragment firstExample on Example {'];

    expect(result).toEqual(expectedResult);
  });
});
