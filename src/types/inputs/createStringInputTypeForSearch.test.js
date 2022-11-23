// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import createStringInputTypeForSearch from './createStringInputTypeForSearch';

describe('createStringInputTypeForSearch', () => {
  test('should create empty string if there are not pagination', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      type: 'tangible',
    };

    const expectedResult = ['', '', {}];

    const result = createStringInputTypeForSearch(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create pageInputType string if there are pagination', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [{ name: 'textField', weight: 1 }],
    };

    const expectedResult = ['', 'String', {}];

    const result = createStringInputTypeForSearch(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
