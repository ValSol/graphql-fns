// @flow

const getProjectionFromInfo = (info: Object): Object => {
  const {
    fieldNodes: [fieldNode],
  } = info;
  const {
    selectionSet: { selections },
  } = fieldNode;
  const result = selections
    .filter(({ kind }) => kind === 'Field')
    .map(({ name: { value } }) => value)
    .reduce((prev, value, i, array) => {
      if (value !== 'id') {
        prev[value] = 1; // eslint-disable-line no-param-reassign
      } else if (array.length === 1) {
        prev._id = 1; // eslint-disable-line no-param-reassign, no-underscore-dangle
      }
      return prev;
    }, {});

  return result;
};

export default getProjectionFromInfo;
