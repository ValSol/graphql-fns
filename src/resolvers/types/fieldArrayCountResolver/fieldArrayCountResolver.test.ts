/* eslint-env jest */

import type { Context } from '../../../tsTypes';

import fieldArrayCountResolver from '.';

describe('fieldArrayCountResolver', () => {
  const parent = {
    title: 'Paris',
    files: [
      { id: '0' },
      { id: '1' },
      { id: '2' },
      { id: '3' },
      { id: '4' },
      { id: '5' },
      { id: '6' },
      { id: '7' },
      { id: '8' },
      { id: '9' },
      { id: '10' },
    ],
  };

  const info = { projection: { _id: 1 }, fieldArgs: {}, path: [], fieldName: 'filesCount' };

  test('should return length of array', async () => {
    const args = {};

    const result = await fieldArrayCountResolver(
      parent,
      args,
      { mongooseConn: {}, pubsub: {} } as Context,
      info,
    );

    const expectedResult = 11;

    expect(result).toEqual(expectedResult);
  });
});
