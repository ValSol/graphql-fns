// @flow

const processForPushEach = (data: {
  [key: string]: Array<any>,
}): { $push: { [key: string]: { $each: Array<any> } } } =>
  Object.keys(data).reduce(
    (prev, key) => {
      prev.$push[key] = { $each: data[key] }; // eslint-disable-line no-param-reassign
      return prev;
    },
    { $push: {} },
  );

export default processForPushEach;
