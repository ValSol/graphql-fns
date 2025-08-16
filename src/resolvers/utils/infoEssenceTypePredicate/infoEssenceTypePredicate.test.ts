/* eslint-env jest */

import infoEssenceTypePredicate from '.';

describe('infoEssenceTypePredicate', () => {
  test('resolvedInfo1', () => {
    const info = {} as any;

    const result = infoEssenceTypePredicate(info);

    const expectedResult = false;

    expect(result).toBe(expectedResult);
  });

  test('resolvedInfo1', () => {
    const info = { projection: {}, fieldArgs: {}, path: [] } as any;

    const result = infoEssenceTypePredicate(info);

    const expectedResult = true;

    expect(result).toBe(expectedResult);
  });
});
