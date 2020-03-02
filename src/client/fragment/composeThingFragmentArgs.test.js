// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeThingFragmentArgs from './composeThingFragmentArgs';

describe('composeThingFragmentArgs', () => {
  test('should compose thing query args ', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = ['fragment myExample on Example {'];

    const result = composeThingFragmentArgs(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
