// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeDerivativeThingsQuery from '../../utils/mergeDerivativeIntoCustom/composeDerivativeThingsQuery';
import composeOptionalActionArgs from './composeOptionalActionArgs';

describe('composeOptionalActionArgs util', () => {
  test('should return right result', async () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          array: true,
          index: true,
          weight: 1,
        },
      ],
    };

    const result = await composeOptionalActionArgs(thingConfig, composeDerivativeThingsQuery);
    const expectedResult = {
      args1: '$where: ExampleWhereInput, $sort: ExampleSortInput, $search: String',
      args2: 'where: $where, sort: $sort, search: $search',
    };

    expect(result).toEqual(expectedResult);
  });
});
