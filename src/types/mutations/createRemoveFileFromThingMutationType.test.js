// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import createRemoveFileFromThingMutationType from './createRemoveFileFromThingMutationType';

describe('createRemoveFileFromThingMutationType', () => {
  test('should create empty string if there are no fileFields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'first name',
        },
      ],
    };
    const expectedResult = '';

    const result = createRemoveFileFromThingMutationType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create mutation upload file thing type', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      fileFields: [
        {
          name: 'logo',
          generalName: 'generalFile',
          fileType: 'fileType',
        },
        {
          name: 'photos',
          generalName: 'generalFile',
          fileType: 'fileType',
          array: true,
        },
      ],
    };
    // data - the array of strings every of which points to file(s) that we have to remove
    const expectedResult =
      '  removeFileFromExample(whereOne: ExampleWhereOneInput!, data: [String!]!, options: FileOfExampleOptionsInput!): Example!';

    const result = createRemoveFileFromThingMutationType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
