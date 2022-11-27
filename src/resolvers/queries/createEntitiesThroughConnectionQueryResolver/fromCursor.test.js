// @flow
/* eslint-env jest */

import fromCursor from './fromCursor';

describe('fromCursor', () => {
  test('normal globalId', () => {
    const cursor = 'NjFhZjM4MGE1YzI4MjU0NDFjYTA3OTAyOjEw';

    const result = fromCursor(cursor);

    const _id = '61af380a5c2825441ca07902'; // eslint-disable-line no-underscore-dangle
    const shift = 10;

    const expectedResult = { _id, shift };

    expect(result).toEqual(expectedResult);
  });

  test('null globalId', () => {
    const cursor = undefined;

    const result = fromCursor(cursor);

    const expectedResult = null;

    expect(result).toEqual(expectedResult);
  });
});
