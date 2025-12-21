const composeSortForAggregateInput = (sortBy: Array<string>) =>
  sortBy.reduce(
    (prev, sortKey) => {
      const [preFieldName, distance] = sortKey.split('_');

      const fieldName = preFieldName === 'id' ? '_id' : preFieldName;

      if (distance === 'ASC') {
        prev.$sort[fieldName] = 1;
      } else if (distance === 'DESC') {
        prev.$sort[fieldName] = -1;
      } else {
        throw new TypeError(`Incorrect sort key: "${sortKey}!"`);
      }

      return prev;
    },
    { $sort: {} } as { $sort: Record<string, 1 | -1> },
  );

export default composeSortForAggregateInput;
