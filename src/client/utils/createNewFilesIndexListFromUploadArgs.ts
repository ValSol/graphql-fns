import type {UploadOptions} from '../../tsTypes';

import createNewFilesIndexList from './createNewFilesIndexList';
import getHashListFromUploadArgs from './getHashListFromUploadArgs';

const createNewFilesIndexListFromUploadArgs = (
  fileFieldName: string,
  values: any,
  uploadArgs: {
    files: Array<any>,
    options: UploadOptions
  },
  getHashFromValue: (arg1: any) => string,
): Array<number> => {
  const hashes = getHashListFromUploadArgs(fileFieldName, uploadArgs);
  return createNewFilesIndexList(hashes, values[fileFieldName], getHashFromValue);
};
export default createNewFilesIndexListFromUploadArgs;
