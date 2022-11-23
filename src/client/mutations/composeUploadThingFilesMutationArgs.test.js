// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import uploadThingFilesMutationAttributes from '../../types/actionAttributes/uploadThingFilesMutationAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeUploadFilesToThingMutationResolver', () => {
  test('should compose uploadFilesToThing mutation args ', () => {
    const prefixName = 'Home';
    const imageConfig: ThingConfig = {
      name: 'RootImage',
      type: 'file',
      textFields: [
        {
          name: 'fileId',
        },
        {
          name: 'address',
        },
      ],
    };

    const expectedResult = [
      'mutation Home_uploadRootImageFiles($files: [Upload!]!, $hashes: [String!]!) {',
      '  uploadRootImageFiles(files: $files, hashes: $hashes) {',
    ];

    const result = composeActionArgs(
      prefixName,
      imageConfig,
      uploadThingFilesMutationAttributes,
      {},
    );
    expect(result).toEqual(expectedResult);
  });
});
