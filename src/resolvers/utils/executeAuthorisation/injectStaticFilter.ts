const injectStaticFilter = (
  staticFilter: {
    [key: string]: any;
  },
  filter: Array<any>,
): Array<any> => {
  if (!filter.length) return [staticFilter];

  if (!Object.keys(staticFilter).length) return filter;

  const amendedfilter = filter.length === 1 ? filter[0] : { OR: filter };

  return [{ AND: [staticFilter, amendedfilter] }];
};

export default injectStaticFilter;
