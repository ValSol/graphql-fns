// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import deleteThingMutationAttributes from '../actionAttributes/deleteThingMutationAttributes';
import composeStandardActionSignature from '../composeStandardActionSignature';

describe('createDeleteThingMutationType', () => {
  test('should create mutation delete thing type', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      type: 'tangible',
    };
    const expectedResult = '  deleteExample(whereOne: ExampleWhereOneInput!): Example!';
    const dic = {};

    const result = composeStandardActionSignature(thingConfig, deleteThingMutationAttributes, dic);
    expect(result).toEqual(expectedResult);
  });
});
