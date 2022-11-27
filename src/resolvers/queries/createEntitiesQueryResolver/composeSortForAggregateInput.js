// @flow

const composeSortInput = (
  sortBy: Array<string>,
): Array<{ $sort: { [fieldName: string]: 1 | -1 } }> =>
  sortBy.map((sortKey) => {
    if (sortKey.slice(-4) === '_ASC') {
      return { $sort: { [sortKey.slice(0, -4)]: 1 } };
    }
    return { $sort: { [sortKey.slice(0, -5)]: -1 } };
  });

export default composeSortInput;
