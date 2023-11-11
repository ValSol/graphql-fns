/* eslint-env jest */

import type { Context } from '../../../tsTypes';

import fieldFilterStringifiedResolver from './index';

describe('fieldFilterStringifiedResolver', () => {
  const parent = {
    title: 'Paris',
    filterField: '{}',
  };

  const info = { fieldName: 'filterFieldStringified' };

  test('should return field content', async () => {
    const args = {};

    const result = await fieldFilterStringifiedResolver(
      parent,
      args,
      { mongooseConn: {}, pubsub: {} } as Context,
      info,
    );

    const expectedResult = '{}';

    expect(result).toBe(expectedResult);
  });
});
