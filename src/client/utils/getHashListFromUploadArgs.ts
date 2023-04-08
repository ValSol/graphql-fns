import type {UploadOptions} from '../../tsTypes';

const getHashListFromUploadArgs = (
  fieldName: string,
  uploadArgs: {
    files: Array<any>,
    options: UploadOptions
  },
): Array<string> => {
  const {
    options: { hashes, targets, counts },
  } = uploadArgs;

  const targetIndex = targets.indexOf(fieldName);

  const hashIndex = counts.reduce((prev, count, i) => (targetIndex > i ? prev + count : prev), 0);
  return hashes.slice(hashIndex, hashIndex + counts[targetIndex]);
};
export default getHashListFromUploadArgs;
