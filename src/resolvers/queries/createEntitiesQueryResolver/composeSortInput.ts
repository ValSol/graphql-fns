const composeSortForAggregateInput = (sortBy: Array<string>): Array<string> => sortBy.map((sortKey) => {
  if (sortKey.slice(-4) === '_ASC') {
    return sortKey.slice(0, -4);
  }
  return `-${sortKey.slice(0, -5)}`;
});

export default composeSortForAggregateInput;
