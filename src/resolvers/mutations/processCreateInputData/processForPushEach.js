// @flow

import renumeratePositions from './renumeratePositions';

type Result = Array<{ $push: { [key: string]: { $each: Array<any> } } }>;

const processForPushEach = (
  data: { [key: string]: Array<any> },
  positions?: { [key: string]: Array<number> } = {},
): Result => {
  const firstItem = Object.keys(data)
    .filter((key) => !positions[key])
    .reduce(
      (prev, key) => {
        prev.$push[key] = { $each: data[key] }; // eslint-disable-line no-param-reassign
        return prev;
      },
      { $push: {} },
    );

  const result = Object.keys(positions).reduce(
    (prev, key) => {
      renumeratePositions(positions[key], data[key].length, Math.max(...positions[key])).forEach(
        (num, i) => {
          prev.push({
            $push: {
              [key]: {
                $each: [data[key][i]],
                $position: num,
              },
            },
          });
        },
      );
      return prev;
    },
    [firstItem],
  );

  return result;
};

export default processForPushEach;
