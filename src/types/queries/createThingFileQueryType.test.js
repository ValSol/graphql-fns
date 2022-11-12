// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import thingFileQueryAttributes from '../actionAttributes/thingFileQueryAttributes';
import composeStandardActionSignature from '../composeStandardActionSignature';

describe('createThingFileQueryType', () => {
  test('should create query', () => {
    const thingConfig: ThingConfig = {
      name: 'RootExample',
      file: true,
    };
    const expectedResult = '  RootExampleFile(whereOne: FileWhereOneInput!): RootExample!';
    const dic = {};

    const result = composeStandardActionSignature(thingConfig, thingFileQueryAttributes, dic);
    expect(result).toEqual(expectedResult);
  });

  test('should create empty query', () => {
    const thingConfig: ThingConfig = {
      name: 'RootExample',
    };
    const expectedResult = '';
    const dic = {};

    const result = composeStandardActionSignature(thingConfig, thingFileQueryAttributes, dic);
    expect(result).toEqual(expectedResult);
  });
});
