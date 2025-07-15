/* eslint-env jest */

import isCommonlyAllowedTypeName from './isCommonlyAllowedTypeName';

describe('isCommonlyAllowedTypeName', () => {
  test('name: "Test1"', () => {
    const name = 'Test1';

    const result = isCommonlyAllowedTypeName(name);

    expect(result).toBe(true);
  });

  test('name: "1Test"', () => {
    const name = '1Test';

    const result = isCommonlyAllowedTypeName(name);

    expect(result).toBe(false);
  });

  test('name: "Test_2"', () => {
    const name = 'Test_2';

    const result = isCommonlyAllowedTypeName(name);

    expect(result).toBe(true);
  });

  test('name: "Test-2"', () => {
    const name = 'Test-2';

    const result = isCommonlyAllowedTypeName(name);

    expect(result).toBe(false);
  });
});
