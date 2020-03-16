// @flow

const rearrangeFilesArray = (
  positions: Array<number>,
  values: Array<Object>,
  uplaodedValues: Array<Object>,
): Array<Object> => {
  const indexLength = positions.length;

  if (!indexLength) return values;

  const newValues = uplaodedValues.slice(-indexLength);
  const results = [...values];

  for (let i = 0; i < indexLength; i += 1) {
    results[positions[i]] = newValues[i];
  }

  return results;
};
export default rearrangeFilesArray;
