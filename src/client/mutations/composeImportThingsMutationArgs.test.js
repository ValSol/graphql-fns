// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeImportThingsMutationArgs from './composeImportThingsMutationArgs';

describe('composeImportThingsMutationArgs', () => {
  test('should compose createThing mutation args ', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = [
      'mutation importExamples($file: Upload!) {',
      '  importExamples(file: $file) {',
    ];

    const result = composeImportThingsMutationArgs(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
