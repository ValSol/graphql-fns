// @flow

import type { ThingConfig, UploadOptions } from '../../flowTypes';

import createNewFilesIndexListFromUploadArgs from './createNewFilesIndexListFromUploadArgs';

const getNewFilesInArraysPositions = (
  values: Object,
  uploadArgs: { files: Array<Object>, options: UploadOptions },
  getHashFromValue: (Object) => string,
  thingConfig: ThingConfig,
): { arrayFiledFieldName: Array<number> } => {
  const { fileFields } = thingConfig;
  if (!fileFields || !uploadArgs.files.length) return {};

  return fileFields.reduce((prev, { name, array }) => {
    if (array) {
      const positions = createNewFilesIndexListFromUploadArgs(
        name,
        values,
        uploadArgs,
        getHashFromValue,
      );
      if (positions.length) prev[name] = positions; // eslint-disable-line no-param-reassign
    }
    return prev;
  }, {});
};
export default getNewFilesInArraysPositions;
