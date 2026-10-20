import type { KeysetSortKey } from './composeKeysetSortKeys';

type Condition = Record<string, any>;

// "true": any document matches, "false": no document matches
const compareKey = (
  fieldName: string,
  value: unknown,
  operator: '$gt' | '$lt',
  inclusive: boolean,
): Condition | boolean => {
  // in a sort MongoDB puts null (& a missing value) before any other value of the field
  if (operator === '$gt') {
    if (value === null) return inclusive ? true : { [fieldName]: { $ne: null } };

    return { [fieldName]: { [inclusive ? '$gte' : '$gt']: value } };
  }

  if (value === null) return inclusive ? { [fieldName]: null } : false;

  const lessThan = { [fieldName]: { [inclusive ? '$lte' : '$lt']: value } };

  if (fieldName === '_id') return lessThan; // never null

  // "$lt" doesn't match null: values of different types are not compared
  return { $or: [lessThan, { [fieldName]: null }] };
};

const and = (conditions: Condition[]): Condition =>
  conditions.length === 1 ? conditions[0] : { $and: conditions };

// returns the condition of the documents that come after (before) the document with "values" of the
// sort "keys"; "inclusive" adds the very document (the last key is "_id" so it's the only one with
// all equal values): "after & inclusive" is the negation of "before" and vice versa
const composeKeysetFilter = (
  keys: KeysetSortKey[],
  values: unknown[],
  side: 'after' | 'before',
  inclusive = false,
): Condition => {
  const lastIndex = keys.length - 1;

  const operatorOf = (direction: 1 | -1) =>
    (direction === 1) === (side === 'after') ? '$gt' : '$lt';

  // a document comes after the cursor if its first different key comes after the cursor's one
  const branches = keys.reduce<Condition[]>((prev, [fieldName, direction], i) => {
    const comparison = compareKey(
      fieldName,
      values[i],
      operatorOf(direction),
      inclusive && i === lastIndex,
    );

    if (comparison === false) return prev;

    const conditions = keys
      .slice(0, i)
      .map(([prevFieldName], j) => ({ [prevFieldName]: values[j] }));

    if (comparison !== true) conditions.push(comparison);

    prev.push(conditions.length > 0 ? and(conditions) : {});

    return prev;
  }, []);

  if (branches.some((branch) => Object.keys(branch).length === 0)) return {};

  const filter = branches.length === 1 ? branches[0] : { $or: branches };

  if (keys.length === 1) return filter;

  // the range of the first key bounds the scan of the index of the sort
  const [[firstFieldName, firstDirection]] = keys;

  const range = compareKey(firstFieldName, values[0], operatorOf(firstDirection), true);

  return range === true ? filter : and([range as Condition, filter]);
};

export default composeKeysetFilter;
