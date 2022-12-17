// @flow
/* eslint-env jest */

import composeDerivativeConfigName from './composeDerivativeConfigName';

describe('composeDerivativeConfigName', () => {
  test('should return config name with derivative in the middle', () => {
    const name = 'ExmapleEdge';
    const derivativeKey = 'ForCabinet';
    const slicePosition = -'Edge'.length;
    const result = composeDerivativeConfigName(name, derivativeKey, slicePosition);

    const expectedResult = 'ExmapleForCabinetEdge';

    expect(result).toBe(expectedResult);
  });

  test('should return config name with derivative at the end', () => {
    const name = 'Exmaple';
    const derivativeKey = 'ForCabinet';
    const result = composeDerivativeConfigName(name, derivativeKey);

    const expectedResult = 'ExmapleForCabinet';

    expect(result).toBe(expectedResult);
  });

  test('should return config name with derivative at the the start', () => {
    const name = 'Exmaple';
    const derivativeKey = 'ForCabinet';
    const slicePosition = 0;
    const result = composeDerivativeConfigName(name, derivativeKey, slicePosition);

    const expectedResult = 'ForCabinetExmaple';

    expect(result).toBe(expectedResult);
  });
});
