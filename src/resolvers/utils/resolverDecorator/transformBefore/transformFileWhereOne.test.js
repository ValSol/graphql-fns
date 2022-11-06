// @flow
/* eslint-env jest */

import toGlobalId from '../../toGlobalId';
import transformFileWhereOne from './transformFileWhereOne';

describe('transformFileWhereOne', () => {
  test('check single id transform', async () => {
    const id = '1234567890';
    const whereOne = { id: toGlobalId(id, 'Image') };

    const result = await transformFileWhereOne(whereOne);

    const expectedResult = { id };

    expect(result).toEqual(expectedResult);
  });
});
