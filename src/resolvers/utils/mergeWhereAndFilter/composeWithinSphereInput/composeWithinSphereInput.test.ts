/* eslint-env jest */

import composeWithinSphereInput from '.';

describe('composeWithinSphereInput', () => {
  test('should create object', () => {
    const gqlWithinSphereInput = {
      center: { lng: 50.435766, lat: 30.515742 },
      radius: 6378100,
    };

    const expectedResult = [[50.435766, 30.515742], 1];

    const result = composeWithinSphereInput(gqlWithinSphereInput);

    expect(result).toEqual(expectedResult);
  });
});
