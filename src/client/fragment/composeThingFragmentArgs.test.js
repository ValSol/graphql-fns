// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeThingFragmentArgs from './composeThingFragmentArgs';

describe('composeThingFragmentArgs', () => {
  test('should compose thing query args ', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const fragmentName = 'firstExample';
    const result = composeThingFragmentArgs(fragmentName, thingConfig);

    const expectedResult = ['fragment firstExample on Example {'];

    expect(result).toEqual(expectedResult);
  });
});
