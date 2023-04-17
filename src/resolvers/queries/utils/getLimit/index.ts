const getLimit = (limit: number, first?: number): number => {
  if (!first) {
    if (limit === Infinity) {
      return 0;
    }

    return limit;
  }

  return Math.min(limit, first);
};

export default getLimit;
