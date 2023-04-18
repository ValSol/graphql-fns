/* eslint-env jest */

import composeDescendantConfigName from './composeDescendantConfigName';

describe('composeDescendantConfigName', () => {
  test('should return config name with descendant in the middle', () => {
    const name = 'ExmapleEdge';
    const descendantKey = 'ForCabinet';
    const slicePosition = -'Edge'.length;
    const result = composeDescendantConfigName(name, descendantKey, slicePosition);

    const expectedResult = 'ExmapleForCabinetEdge';

    expect(result).toBe(expectedResult);
  });

  test('should return config name with descendant at the end', () => {
    const name = 'Exmaple';
    const descendantKey = 'ForCabinet';
    const result = composeDescendantConfigName(name, descendantKey);

    const expectedResult = 'ExmapleForCabinet';

    expect(result).toBe(expectedResult);
  });

  test('should return config name with descendant at the the start', () => {
    const name = 'Exmaple';
    const descendantKey = 'ForCabinet';
    const slicePosition = 0;
    const result = composeDescendantConfigName(name, descendantKey, slicePosition);

    const expectedResult = 'ForCabinetExmaple';

    expect(result).toBe(expectedResult);
  });
});
