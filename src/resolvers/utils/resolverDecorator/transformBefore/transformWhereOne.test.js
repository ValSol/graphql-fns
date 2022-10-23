// @flow
/* eslint-env jest */

import toGlobalId from '../../toGlobalId';
import transformWhereOne from './transformWhereOne';

describe('transformWhereOne', () => {
  test('check single id transform', async () => {
    const id = '1234567890';
    const whereOne = { id: toGlobalId(id, 'thingName') };

    const result = await transformWhereOne(whereOne);

    const expectedResult = { id };

    expect(result).toEqual(expectedResult);
  });

  test('check single no id transform', async () => {
    const whereOne = { slug: 'abc' };

    const result = await transformWhereOne(whereOne);

    const expectedResult = whereOne;

    expect(result).toEqual(expectedResult);
  });

  test('check array id transform', async () => {
    const id = '1234567890';
    const whereOne = [{ id: toGlobalId(id, 'thingName') }];

    const result = await transformWhereOne(whereOne);

    const expectedResult = [{ id }];

    expect(result).toEqual(expectedResult);
  });

  test('check array no id transform', async () => {
    const whereOne = [{ slug: 'abc' }];

    const result = await transformWhereOne(whereOne);

    const expectedResult = whereOne;

    expect(result).toEqual(expectedResult);
  });
});
