/* eslint-env jest */
import type { EntityConfig } from '../../tsTypes';

import createStringInputTypeForSearch from './createStringInputTypeForSearch';

describe('createStringInputTypeForSearch', () => {
  test('should create empty string if there are not pagination', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
    };

    const expectedResult = ['', '', {}];

    const result = createStringInputTypeForSearch(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create pageInputType string if there are pagination', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [{ name: 'textField', weight: 1, type: 'textFields' }],
    };

    const expectedResult = ['', 'String', {}];

    const result = createStringInputTypeForSearch(entityConfig);
    expect(result).toEqual(expectedResult);
  });
});
