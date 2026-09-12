/* eslint-env jest */

import composeRepresentationConfigName from './composeRepresentationConfigName';

describe('composeRepresentationConfigName', () => {
  test('should return config name with representation in the middle', () => {
    const name = 'ExmapleEdge';
    const representationKey = 'ForCabinet';
    const slicePosition = -'Edge'.length;
    const result = composeRepresentationConfigName(name, representationKey, slicePosition);

    const expectedResult = 'ExmapleForCabinetEdge';

    expect(result).toBe(expectedResult);
  });

  test('should return config name with representation at the end', () => {
    const name = 'Exmaple';
    const representationKey = 'ForCabinet';
    const result = composeRepresentationConfigName(name, representationKey);

    const expectedResult = 'ExmapleForCabinet';

    expect(result).toBe(expectedResult);
  });

  test('should return config name with representation at the the start', () => {
    const name = 'Exmaple';
    const representationKey = 'ForCabinet';
    const slicePosition = 0;
    const result = composeRepresentationConfigName(name, representationKey, slicePosition);

    const expectedResult = 'ForCabinetExmaple';

    expect(result).toBe(expectedResult);
  });
});
