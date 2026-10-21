import parseSortKey from '../utils/parseSortKey';

const composeSortForAggregateInput = (sortBy: Array<string>) =>
  sortBy.reduce(
    (prev, sortKey) => {
      const [fieldName, direction] = parseSortKey(sortKey);

      prev.$sort[fieldName] = direction;

      return prev;
    },
    { $sort: {} } as { $sort: Record<string, 1 | -1> },
  );

export default composeSortForAggregateInput;
