// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeUploadFileToThingMutationResolver from './composeUploadFileToThingMutationResolver';

describe('composeUploadFileToThingMutationResolver', () => {
  test('should compose uploadFileToThing mutation args ', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = [
      'mutation uploadFileToExample($whereOne: ExampleWhereOneInput!, $file: Upload!, $options: FileOfExampleOptionsInput!) {',
      '  uploadFileToExample(whereOne: $whereOne, file: $file, options: $options) {',
    ];

    const result = composeUploadFileToThingMutationResolver(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
