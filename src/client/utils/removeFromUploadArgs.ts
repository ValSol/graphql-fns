import type {UploadOptions} from '../../tsTypes';

type UploadArgs = {
  files: Array<any>,
  options: UploadOptions
};

const removeFromUploadArgs = (
  hashesForRemove: Array<string>,
  fileFieldName: string,
  prevArgs: UploadArgs,
): any => {
  const {
    files: prevFiles,
    options: { targets: prevTargets, counts: prevCounts, hashes: prevHashes },
  } = prevArgs;

  const files = [...prevFiles];
  const targets = [...prevTargets];
  const counts = [...prevCounts];
  const hashes = [...prevHashes];

  let index = 0;
  let deltaJ = 0;
  prevTargets.forEach((fieldName, i) => {
    if (fieldName === fileFieldName) {
      for (let j = index; j < index + prevCounts[i]; j += 1) {
        if (hashesForRemove.includes(prevHashes[j])) {
          counts[i] -= 1;

          if (!counts[i]) {
            counts.splice(i, 1);
            targets.splice(i, 1);
          }

          hashes.splice(j - deltaJ, 1);
          files.splice(j - deltaJ, 1);
          deltaJ += 1;
        }
      }
    }
    index += prevCounts[i];
  });

  return { files, options: { counts, hashes, targets } };
};

export default removeFromUploadArgs;
