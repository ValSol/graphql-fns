import type {EntityConfig, UploadOptions} from '../../tsTypes';

import createNewFilesIndexListFromUploadArgs from './createNewFilesIndexListFromUploadArgs';

const getNewFilesInArraysPositions = (
  values: any,
  uploadArgs: {
    files: Array<any>,
    options: UploadOptions
  },
  getHashFromValue: (arg1: any) => string,
  entityConfig: EntityConfig,
): {
  [arrayFiledFieldName: string]: Array<number>
} => {
  const { fileFields } = entityConfig;
  if (!fileFields || !uploadArgs.files.length) return {};

  return fileFields.reduce<Record<string, any>>((prev, { name, array }) => {
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
