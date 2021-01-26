// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeImportThingsMutationArgs from './composeImportThingsMutationArgs';

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

    const result = composeImportThingsMutationArgs(prefixName, thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
