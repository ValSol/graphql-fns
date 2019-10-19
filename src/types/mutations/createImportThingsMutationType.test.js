// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import createImportThingsMutationType from './createImportThingsMutationType';

describe('createImportThingsMutationType', () => {
  test('should create mutation import things type', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
    };
    const expectedResult = '  importExamples(file: Upload!): [Example!]!';

    const result = createImportThingsMutationType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
