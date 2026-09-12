/* eslint-env jest */

import toGlobalId from '.';

describe('toGlobalId', () => {
  test('filter empty', () => {
    const rawId = '61af380a5c2825441ca07902';
    const entityName = 'Restaurant';
    const representationKey = 'ForView';

    const result = toGlobalId(rawId, entityName, representationKey);

    const expectedResult = 'NjFhZjM4MGE1YzI4MjU0NDFjYTA3OTAyOlJlc3RhdXJhbnQ6Rm9yVmlldw==';

    expect(result).toBe(expectedResult);
  });
});
