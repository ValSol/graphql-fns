// @flow

const renumeratePositions = (
  positions?: Array<number>,
  createLength: number,
  idsLength: number,
): Array<number> => {
  if (positions && positions.length !== createLength) {
    throw new TypeError(
      `Length of positions array: "${positions.length}", length of create array: "${createLength}"!`,
    );
  } else if (
    positions &&
    (Math.max(...positions) > idsLength + createLength - 1 || Math.min(...positions) < 0)
  ) {
    throw new TypeError(
      `Incorrect positions: "${String(
        positions,
      )}", for idsLength: "${idsLength}" and createLength: "${createLength}"!`,
    );
  }

  if (!positions) {
    const result = [];
    for (let i = 0; i < createLength; i += 1) {
      result.push(i + idsLength);
    }
    return result;
  }

  return positions.map((num, i, arr) => {
    const delta = arr.slice(i).reduce((prev, num2) => (num > num2 ? prev + 1 : prev), 0);
    return num - delta;
  });
};

export default renumeratePositions;
