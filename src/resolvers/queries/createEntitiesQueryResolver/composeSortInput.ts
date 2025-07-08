const composeSortInput = (sortBy: Array<string>): Array<string> =>
  sortBy.map((sortKey) => {
    if (sortKey.slice(-4) === '_ASC') {
      const key = sortKey.slice(0, -'_ASC'.length);
      return key === 'id' ? '_id' : key;
    }

    const key = sortKey.slice(0, -'_DESC'.length);
    return key === 'id' ? '-_id' : `-${key}`;
  });

export default composeSortInput;
