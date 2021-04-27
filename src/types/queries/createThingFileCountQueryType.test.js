// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import thingFileCountQueryAttributes from '../actionAttributes/thingFileCountQueryAttributes';
import composeStandardActionSignature from '../composeStandardActionSignature';

describe('createThingFileCountQueryType', () => {
  test('should create query', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      file: true,
    };
    const expectedResult = '  ExampleFileCount(where: FileWhereInput): Int!';
    const dic = {};

    const result = composeStandardActionSignature(thingConfig, thingFileCountQueryAttributes, dic);
    expect(result).toEqual(expectedResult);
  });

  test('should create empty query', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
    };
    const expectedResult = '';
    const dic = {};

    const result = composeStandardActionSignature(thingConfig, thingFileCountQueryAttributes, dic);
    expect(result).toEqual(expectedResult);
  });
});
