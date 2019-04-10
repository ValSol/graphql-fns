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
    .reduce((prev, value) => {
      // eslint-disable-next-line no-param-reassign
      if (value !== 'id') prev[value] = 1;
      return prev;
    }, {});

  return result;
};

module.exports = getProjectionFromInfo;
