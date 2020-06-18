// @flow

const addFilter = (filter: Object, where: Object): Object => {
  if (!filter.length) return where;

  if (!where || !Object.keys(where).length) {
    if (filter.length === 1) return filter[0];
    return { OR: filter };
  }

  if (filter.length === 1) return { AND: [where, filter[0]] };

  return { AND: [where, { OR: filter }] };
};

export default addFilter;
