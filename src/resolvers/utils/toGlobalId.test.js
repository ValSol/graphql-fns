// @flow
/* eslint-env jest */

import toGlobalId from './toGlobalId';

describe('toGlobalId', () => {
  test('filter empty', () => {
    const rawId = '61af380a5c2825441ca07902';
    const thingName = 'Restaurant';
    const suffix = 'ForView';

    const result = toGlobalId(rawId, thingName, suffix);

    const expectedResult = 'NjFhZjM4MGE1YzI4MjU0NDFjYTA3OTAyOlJlc3RhdXJhbnQ6Rm9yVmlldw==';

    expect(result).toBe(expectedResult);
  });
});
