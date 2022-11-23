// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import importThingsMutationAttributes from '../actionAttributes/importThingsMutationAttributes';
import composeStandardActionSignature from '../composeStandardActionSignature';

describe('createImportThingsMutationType', () => {
  test('should create mutation import things type', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      type: 'tangible',
    };
    const expectedResult =
      '  importExamples(file: Upload!, options: ImportOptionsInput): [Example!]!';
    const dic = {};

    const result = composeStandardActionSignature(thingConfig, importThingsMutationAttributes, dic);
    expect(result).toEqual(expectedResult);
  });
});
