// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import thingQueryAttributes from '../actionAttributes/thingQueryAttributes';
import composeStandardActionSignature from '../composeStandardActionSignature';

describe('createThingQueryType', () => {
  test('should create query only thing type', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      type: 'tangible',
    };
    const expectedResult = '  Example(whereOne: ExampleWhereOneInput!): Example!';
    const dic = {};

    const result = composeStandardActionSignature(thingConfig, thingQueryAttributes, dic);
    expect(result).toEqual(expectedResult);
  });
});
