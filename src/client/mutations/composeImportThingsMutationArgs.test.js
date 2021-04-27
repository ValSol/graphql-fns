// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import importThingsMutationAttributes from '../../types/actionAttributes/importThingsMutationAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeImportThingsMutationArgs', () => {
  test('should compose createThing mutation args ', () => {
    const prefixName = 'Home';
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = [
      'mutation Home_importExamples($file: Upload!, $options: ImportOptionsInput) {',
      '  importExamples(file: $file, options: $options) {',
    ];

    const result = composeActionArgs(prefixName, thingConfig, importThingsMutationAttributes);
    expect(result).toEqual(expectedResult);
  });
});
