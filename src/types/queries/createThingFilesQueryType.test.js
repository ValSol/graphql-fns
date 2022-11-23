// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import thingFilesQueryAttributes from '../actionAttributes/thingFilesQueryAttributes';
import composeStandardActionSignature from '../composeStandardActionSignature';

describe('createThingFilesQueryType', () => {
  test('should create query only thing type', () => {
    const thingConfig: ThingConfig = {
      name: 'RootExample',
      type: 'file',
    };
    const expectedResult = '  RootExampleFiles(where: FileWhereInput): [RootExample!]!';
    const dic = {};

    const result = composeStandardActionSignature(thingConfig, thingFilesQueryAttributes, dic);
    expect(result).toEqual(expectedResult);
  });
});
