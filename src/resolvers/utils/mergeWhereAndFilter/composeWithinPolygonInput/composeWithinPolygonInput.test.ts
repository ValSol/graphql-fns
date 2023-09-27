/* eslint-env jest */

import composeWithinPolygonInput from '.';

describe('composeWithinPolygonInput', () => {
  test('should create externalRing', () => {
    const gqlWithinPolygonInput = [
      { lat: 50.42551, lng: 30.42759 },
      { lat: 50.42551, lng: 30.42761 },
      { lat: 50.42549, lng: 30.42761 },
      { lat: 50.42549, lng: 30.42759 },
      { lat: 50.42551, lng: 30.42759 },
    ];

    const expectedResult = [
      [30.42759, 50.42551],
      [30.42761, 50.42551],
      [30.42761, 50.42549],
      [30.42759, 50.42549],
      [30.42759, 50.42551],
    ];

    const result = composeWithinPolygonInput(gqlWithinPolygonInput);

    expect(result).toEqual(expectedResult);
  });
});
