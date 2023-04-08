const injectStaticFilter = (
  staticFilter: {
    [key: string]: any
  },
  filter: Array<any>,
): Array<any> => {
  if (!filter.length) return [staticFilter];

  if (!Object.keys(staticFilter).length) return filter;

  const amndedfilter = filter.length === 1 ? filter[0] : { OR: filter };

  return [{ AND: [staticFilter, amndedfilter] }];
};

export default injectStaticFilter;
