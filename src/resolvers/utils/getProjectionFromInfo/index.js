// @flow

type Path = Array<string>;

const getProjectionFromSelectionSet = (selectionSet, path: Path): { [fieldName: string]: 1 } => {
  const { selections } = selectionSet;
  if (path.length) {
    const [fieldName, ...rest] = path;
    const obj = selections.find(
      ({ kind, name: { value } }) => kind === 'Field' && value === fieldName,
    );
    return obj ? getProjectionFromSelectionSet(obj.selectionSet, rest) : {};
  }

  return selections
    .filter(({ kind }) => kind === 'Field')
    .map(({ name: { value } }) => value)
    .filter((field) => field !== '__typename')
    .reduce((prev, value, i, array) => {
      if (value !== 'id') {
        prev[value] = 1; // eslint-disable-line no-param-reassign
      } else if (array.length === 1) {
        prev._id = 1; // eslint-disable-line no-param-reassign, no-underscore-dangle
      }
      return prev;
    }, {});
};

const getProjectionFromInfo = (info: Object, path?: Path): { [fieldName: string]: 1 } => {
  const { fieldNodes } = info;
  if (!fieldNodes) return info.projection; // use custom info in some cases when call resolver manually

  const [fieldNode] = fieldNodes;
  const { selectionSet } = fieldNode;

  return getProjectionFromSelectionSet(selectionSet, path || []);
};

export default getProjectionFromInfo;
