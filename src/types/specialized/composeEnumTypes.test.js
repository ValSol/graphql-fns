// @flow
/* eslint-env jest */
import type { Enums, GeneralConfig } from '../../flowTypes';

import composeEnumTypes from './composeEnumTypes';

describe('composeEnumTypes', () => {
  test('should return empty string if enums undefined', () => {
    const generalConfig: GeneralConfig = {
      allEntityConfigs: {},
    };
    const expectedResult = '';

    const result = composeEnumTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should return empty string if there are not any enumerations', () => {
    const generalConfig: GeneralConfig = {
      allEntityConfigs: {},
    };
    const expectedResult = '';

    const result = composeEnumTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should return empty string if there are not any enumerations', () => {
    const enumeration1 = ['key1_1', 'key1_2', 'key1_3'];
    const enumeration2 = ['key2_1', 'key2_2', 'key2_3'];
    const enums: Enums = { Enumeration1: enumeration1, Enumeration2: enumeration2 };

    const generalConfig: GeneralConfig = {
      allEntityConfigs: {},
      enums,
    };
    const expectedResult = `enum Enumeration1Enumeration {
  key1_1
  key1_2
  key1_3
}
enum Enumeration2Enumeration {
  key2_1
  key2_2
  key2_3
}`;

    const result = composeEnumTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });
});
