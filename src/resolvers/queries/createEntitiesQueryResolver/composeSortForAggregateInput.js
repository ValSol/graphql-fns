// @flow

const composeSortForAggregateInput = (
  sortBy: Array<string>,
): Array<{ $sort: { [fieldName: string]: 1 | -1 } }> =>
  sortBy.map((sortKey) => {
    const [fieldName, distance] = sortKey.split('_');

    if (distance === 'ASC') {
      return { $sort: { [fieldName]: 1 } };
    }

    if (distance === 'DESC') {
      return { $sort: { [fieldName]: -1 } };
    }

    throw new TypeError(`Incorrect sort key: "${sortKey}!"`);
  });

export default composeSortForAggregateInput;
