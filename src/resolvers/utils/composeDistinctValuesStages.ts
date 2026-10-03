// composes the aggregate stages that return the distinct values of "target" as "{ _id: value }" ...
// ... documents in the order of "distinct" (BSON order); arrays are unwound as "distinct" does: ...
// ... "$unwind" of a dotted path (e.g. "names.text") doesn't go through an array of embedded ...
// ... documents, so the value is projected first and unwound once for every segment of the path
const composeDistinctValuesStages = (target: string): Record<string, any>[] => {
  const segments = target.split('.');

  if (segments.length === 1) {
    return [{ $unwind: `$${target}` }, { $group: { _id: `$${target}` } }, { $sort: { _id: 1 } }];
  }

  return [
    { $project: { _id: 0, value: `$${target}` } },
    ...segments.map(() => ({ $unwind: '$value' })),
    { $group: { _id: '$value' } },
    { $sort: { _id: 1 } },
  ];
};

export default composeDistinctValuesStages;
