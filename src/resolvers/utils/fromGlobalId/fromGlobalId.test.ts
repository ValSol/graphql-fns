/* eslint-env jest */

import fromGlobalId from '.';

describe('fromGlobalId', () => {
  test('normal globalId', () => {
    const globalId = 'NjFhZjM4MGE1YzI4MjU0NDFjYTA3OTAyOlJlc3RhdXJhbnQ6Rm9yVmlldw==';

    const result = fromGlobalId(globalId);

    const _id = '61af380a5c2825441ca07902'; // eslint-disable-line no-underscore-dangle
    const entityName = 'Restaurant';
    const descendantKey = 'ForView';

    const expectedResult = { _id, entityName, descendantKey };

    expect(result).toEqual(expectedResult);
  });

  test('null globalId', () => {
    const globalId = null;

    const result = fromGlobalId(globalId);

    const expectedResult = { _id: null, entityName: '', descendantKey: '' };

    expect(result).toEqual(expectedResult);
  });
});
