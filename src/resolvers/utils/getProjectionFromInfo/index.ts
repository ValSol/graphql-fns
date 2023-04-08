import type { ProjectionInfo, SintheticResolverInfo } from '../../../tsTypes';

type Path = Array<string>;

type SelectionSet = {
  selections: Array<{ kind: string; name: { value: string }; selectionSet: SelectionSet }>;
};

const getProjectionFromSelectionSet = (
  selectionSet: SelectionSet,
  path: Path,
): {
  [fieldName: string]: 1;
} => {
  const { selections } = selectionSet;
  if (path.length) {
    const [fieldName, ...rest] = path;
    const obj = selections.find(
      ({ kind, name: { value } }) => kind === 'Field' && value === fieldName,
    );
    return obj ? getProjectionFromSelectionSet(obj.selectionSet, rest) : {};
  }

  const result = (selections as { kind: string; name: { value: string } }[])
    .filter(({ kind }) => kind === 'Field')
    .map(({ name: { value } }) => value)
    .filter((field) => field !== '__typename')
    .reduce<Record<string, 1>>((prev, value) => {
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

const projectionTypePredicate = (info: SintheticResolverInfo): info is ProjectionInfo =>
  Boolean((info as ProjectionInfo).projection);

const getProjectionFromInfo = (
  info: SintheticResolverInfo,
  path?: Path,
): {
  [fieldName: string]: 1;
} => {
  if (projectionTypePredicate(info)) {
    return info.projection;
  }

  const {
    fieldNodes: [{ selectionSet }],
  } = info;

  if (!selectionSet) {
    return { _id: 1 };
  }

  const preResult = getProjectionFromSelectionSet(
    selectionSet as unknown as SelectionSet,
    path || [],
  );

  const result = Object.keys(preResult).reduce<Record<string, any>>((prev, key) => {
    if (key.endsWith('ThroughConnection')) {
      prev[`${key.slice(0, -'ThroughConnection'.length)}`] = 1; // eslint-disable-line no-param-reassign
    } else {
      prev[key] = 1; // eslint-disable-line no-param-reassign
    }
    return prev;
  }, {});

  return result;
};

export default getProjectionFromInfo;
