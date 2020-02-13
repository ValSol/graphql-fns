// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import createRemoveManyFilesFromThingMutationType from './createRemoveManyFilesFromThingMutationType';

describe('createRemoveManyFilesFromThingMutationType', () => {
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

    const result = createRemoveManyFilesFromThingMutationType(thingConfig);
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
      '  removeManyFilesFromExample(whereOne: ExampleWhereOneInput!, data: [String!]!, options: ManyFilesOfExampleOptionsInput!): Example!';

    const result = createRemoveManyFilesFromThingMutationType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
