// @flow
/* eslint-env jest */

import getDistanceFromLatLng from './getDistanceFromLatLng';

describe('getDistanceFromLatLng', () => {
  test('should return array with correct setted fields', () => {
    const lat1 = 50.7658966;
    const lng1 = 29.2417428;
    const lat2 = 50.516326;
    const lng2 = 30.6021406;

    const result = getDistanceFromLatLng(lat1, lng1, lat2, lng2);

    const expectedResult = 99862.93583791083;

    expect(result).toEqual(expectedResult);
  });
});
