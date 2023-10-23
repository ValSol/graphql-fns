/* eslint-env jest */

import toGlobalId from '.';

describe('toGlobalId', () => {
  test('filter empty', () => {
    const rawId = '61af380a5c2825441ca07902';
    const entityName = 'Restaurant';
    const descendantKey = 'ForView';

    const result = toGlobalId(rawId, entityName, descendantKey);

    const expectedResult = 'NjFhZjM4MGE1YzI4MjU0NDFjYTA3OTAyOlJlc3RhdXJhbnQ6Rm9yVmlldw==';

    expect(result).toBe(expectedResult);
  });
});
