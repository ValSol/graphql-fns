// @flow

import type { UploadOptions } from '../../flowTypes';

import createNewFilesIndexList from './createNewFilesIndexList';
import getHashListFromUploadArgs from './getHashListFromUploadArgs';

const createNewFilesIndexListFromUploadArgs = (
  fileFieldName: string,
  values: Object,
  uploadArgs: { files: Array<Object>, options: UploadOptions },
  getHashFromValue: (Object) => string,
): Array<number> => {
  const hashes = getHashListFromUploadArgs(fileFieldName, uploadArgs);
  return createNewFilesIndexList(hashes, values[fileFieldName], getHashFromValue);
};
export default createNewFilesIndexListFromUploadArgs;
