// @flow
/* eslint-env jest */

import type { EntityConfig } from '../../flowTypes';

import importEntitiesMutationAttributes from '../actionAttributes/importEntitiesMutationAttributes';
import composeStandardActionSignature from '../composeStandardActionSignature';

describe('createImportEntitiesMutationType', () => {
  test('should create mutation import entities type', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
    };
    const expectedResult =
      '  importExamples(file: Upload!, options: ImportOptionsInput): [Example!]!';
    const dic = {};

    const result = composeStandardActionSignature(
      entityConfig,
      importEntitiesMutationAttributes,
      dic,
    );
    expect(result).toEqual(expectedResult);
  });
});
