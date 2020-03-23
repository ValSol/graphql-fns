// @flow

const createNewFilesIndexList = (
  hashes: Array<string>,
  fileFieldValues: Array<Object>,
  getHashFromValue: (Object) => string,
): Array<number> =>
  fileFieldValues.reduce((prev, value, i) => {
    const hash = getHashFromValue(value);
    if (hash) {
      const index = hashes.indexOf(hash);
      if (index === -1) {
        throw TypeError(`Can not find hash: "${hash}" in hash list!`);
      }
      prev[index] = i; // eslint-disable-line no-param-reassign
    }
    return prev;
  }, []);
export default createNewFilesIndexList;
