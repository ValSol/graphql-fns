// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeUploadFilesToThingMutationResolver from './composeUploadFilesToThingMutationResolver';

describe('composeUploadFilesToThingMutationResolver', () => {
  test('should compose uploadFilesToThing mutation args ', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = [
      'mutation uploadFilesToExample($whereOne: ExampleWhereOneInput!, $files: [Upload!]!, $options: FilesOfExampleOptionsInput!) {',
      '  uploadFilesToExample(whereOne: $whereOne, files: $files, options: $options) {',
    ];

    const result = composeUploadFilesToThingMutationResolver(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
