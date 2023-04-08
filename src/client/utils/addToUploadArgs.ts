import type {UploadOptions} from '../../tsTypes';

import getFileMD5Hash from './getFileMD5Hash';

type UploadArgs = {
  files: Array<any>,
  options: UploadOptions
};

const addToUploadArgs = async (
  newFiles: Array<any>,
  fileFieldName: string,
  prevArgs: UploadArgs,
  calculateHash: (arg1: any) => Promise<string> = getFileMD5Hash,
): Promise<any> => {
  const prevFiles = prevArgs && prevArgs.files ? prevArgs && prevArgs.files : [];
  const prevOptions = (prevArgs && prevArgs.options) || {
    targets: [],
    counts: [],
    hashes: [],
  };
  const { targets: prevTargets, counts: prevCounts, hashes: prevHashes } = prevOptions;

  const promises = newFiles.reduce<Array<any>>((prev, item) => {
    prev.push(calculateHash(item));
    return prev;
  }, []);
  const newHashes = await Promise.all(promises);

  const files = [...prevFiles];
  const targets = [...prevTargets];
  const counts = [...prevCounts];
  const hashes = [...prevHashes];

  const index = targets.indexOf(fileFieldName);
  if (index === -1) {
    if (newFiles.length) files.push(...newFiles);
    targets.push(fileFieldName);
    counts.push(newFiles.length);
    if (newHashes.length) hashes.push(...newHashes);
  } else {
    const hashIndex = counts.reduce((prev, count, i) => (i > index ? prev : prev + count), 0);
    hashes.splice(hashIndex, 0, ...newHashes);
    files.splice(hashIndex, 0, ...newFiles);
    counts[index] += newFiles.length;
  }

  return { files, options: { counts, hashes, targets } };
};

export default addToUploadArgs;
