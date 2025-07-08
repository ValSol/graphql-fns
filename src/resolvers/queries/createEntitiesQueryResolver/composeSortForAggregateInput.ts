const composeSortForAggregateInput = (
  sortBy: Array<string>,
): Array<{
  $sort: {
    [fieldName: string]: 1 | -1;
  };
}> =>
  sortBy.map((sortKey) => {
    const [preFieldName, distance] = sortKey.split('_');

    const fieldName = preFieldName === 'id' ? '_id' : preFieldName;

    if (distance === 'ASC') {
      return { $sort: { [fieldName]: 1 } };
    }

    if (distance === 'DESC') {
      return { $sort: { [fieldName]: -1 } };
    }

    throw new TypeError(`Incorrect sort key: "${sortKey}!"`);
  });

export default composeSortForAggregateInput;
