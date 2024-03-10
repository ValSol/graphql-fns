const injectStaticOrPersonalFilter = (
  staticOrPersonalFilter: {
    [key: string]: any;
  },
  filter: Array<any>,
): Array<any> => {
  if (filter.length === 0) return [staticOrPersonalFilter];

  if (Object.keys(staticOrPersonalFilter).length === 0) return filter;

  const amendedfilter = filter.length === 1 ? filter[0] : { OR: filter };

  return [{ AND: [staticOrPersonalFilter, amendedfilter] }];
};

export default injectStaticOrPersonalFilter;
