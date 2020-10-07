// @flow

const setByPositions = (arr: Array<any>, positions: Array<number>): Array<any> => {
  const result = [];
  const { length } = arr;

  if (length < positions.length) {
    throw new TypeError(
      `Too long positions array: "${positions.length}" but maximum: "${length}"!`,
    );
  }

  const newArr = arr.slice(-positions.length);

  positions.forEach((pos, i) => {
    if (pos > length - 1) {
      throw new TypeError(`Too large position: "${pos}" but maximum: "${length - 1}"!`);
    }
    if (pos < 0) {
      throw new TypeError(`Negative position: "${pos}"!`);
    }
    result[pos] = newArr[i];
  });

  let index = 0;
  for (let i = 0; i < length - positions.length; i += 1) {
    while (result[index] !== undefined) {
      index += 1;
    }
    result[index] = arr[i];
  }

  return result;
};

export default setByPositions;
