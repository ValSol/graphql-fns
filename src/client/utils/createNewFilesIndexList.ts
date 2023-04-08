const createNewFilesIndexList = (
  hashes: Array<string>,
  fileFieldValues: Array<any>,
  getHashFromValue: (value: any, onlyBlob?: boolean) => string,
): Array<number> => {
  const indexes: Record<string, any> = {};

  const result = fileFieldValues.reduce<Array<any>>((prev, value, i) => {
    const onlyBlob = true;
    const hash = getHashFromValue(value, onlyBlob);
    if (hash) {
      const index = hashes.indexOf(hash, indexes[hash]);
      indexes[hash] = index + 1;
      if (index === -1) {
        throw TypeError(`Can not find hash: "${hash}" in hash list!`);
      }
      prev[index] = i; // eslint-disable-line no-param-reassign
    }
    return prev;
  }, []);

  return result;
};
export default createNewFilesIndexList;
