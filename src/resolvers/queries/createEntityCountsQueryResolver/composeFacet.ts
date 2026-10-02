const composeFacet = (whereArr: Record<string, any>[]) => {
  const $facet = whereArr.reduce(
    (prev, where, i) => {
      prev[i] =
        !where || Object.keys(where).length === 0
          ? [{ $count: 'count' }]
          : [{ $match: where }, { $count: 'count' }];

      return prev;
    },
    {} as Record<
      string,
      [{ $match: Record<string, any> }, { $count: 'count' }] | [{ $count: 'count' }]
    >,
  );

  return { $facet };
};

export default composeFacet;
