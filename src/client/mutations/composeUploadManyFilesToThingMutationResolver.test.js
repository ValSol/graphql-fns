// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeUploadManyFilesToThingMutationResolver from './composeUploadManyFilesToThingMutationResolver';

describe('composeUploadManyFilesToThingMutationResolver', () => {
  test('should compose uploadManyFileToThing mutation args ', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = [
      'mutation uploadManyFilesToExample($whereOne: ExampleWhereOneInput!, $files: [Upload!]!, $options: ManyFilesOfExampleOptionsInput!) {',
      '  uploadManyFilesToExample(whereOne: $whereOne, files: $files, options: $options) {',
    ];

    const result = composeUploadManyFilesToThingMutationResolver(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
