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

  const result = selections
    .filter(({ kind }) => kind === 'Field')
    .map(({ name: { value } }) => value)
    .filter((field) => field !== '__typename')
    .reduce((prev, value) => {
      if (value !== 'id') {
        prev[value] = 1; // eslint-disable-line no-param-reassign
      }

      return prev;
    }, {});

  selections
    .filter(({ kind }) => kind === 'InlineFragment')
    .forEach(({ selectionSet: selectionSet2 }) => {
      const inlineResult = getProjectionFromSelectionSet(selectionSet2, []);

      Object.assign(result, inlineResult);
    });

  if (!Object.keys(result).length) {
    result._id = 1; // eslint-disable-line no-underscore-dangle
  }

  return result;
};

const getProjectionFromInfo = (info: Object, path?: Path): { [fieldName: string]: 1 } => {
  const { fieldNodes } = info;
  if (!fieldNodes) return info.projection; // use custom info in some cases when call resolver manually

  const [fieldNode] = fieldNodes;
  const { selectionSet } = fieldNode;

  if (!selectionSet) {
    return { _id: 1 };
  }

  return getProjectionFromSelectionSet(selectionSet, path || []);
};

export default getProjectionFromInfo;
