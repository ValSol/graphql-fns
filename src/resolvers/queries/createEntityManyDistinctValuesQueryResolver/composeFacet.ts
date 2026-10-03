import composeDistinctValuesStages from '../../utils/composeDistinctValuesStages';

const composeFacet = (items: { target: string; where?: Record<string, any> }[]) => {
  const $facet = items.reduce(
    (prev, { target, where }, i) => {
      prev[i] =
        !where || Object.keys(where).length === 0
          ? composeDistinctValuesStages(target)
          : [{ $match: where }, ...composeDistinctValuesStages(target)];

      return prev;
    },
    {} as Record<string, Record<string, any>[]>,
  );

  return { $facet };
};

export default composeFacet;
