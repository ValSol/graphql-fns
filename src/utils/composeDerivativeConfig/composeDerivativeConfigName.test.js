// @flow
/* eslint-env jest */

import composeDerivativeConfigName from './composeDerivativeConfigName';

describe('composeDerivativeConfigName', () => {
  test('should return config name with derivative in the middle', () => {
    const name = 'ExmapleEdge';
    const suffix = 'ForCabinet';
    const slicePosition = -'Edge'.length;
    const result = composeDerivativeConfigName(name, suffix, slicePosition);

    const expectedResult = 'ExmapleForCabinetEdge';

    expect(result).toBe(expectedResult);
  });

  test('should return config name with derivative at the end', () => {
    const name = 'Exmaple';
    const suffix = 'ForCabinet';
    const result = composeDerivativeConfigName(name, suffix);

    const expectedResult = 'ExmapleForCabinet';

    expect(result).toBe(expectedResult);
  });

  test('should return config name with derivative at the the start', () => {
    const name = 'Exmaple';
    const suffix = 'ForCabinet';
    const slicePosition = 0;
    const result = composeDerivativeConfigName(name, suffix, slicePosition);

    const expectedResult = 'ForCabinetExmaple';

    expect(result).toBe(expectedResult);
  });
});
