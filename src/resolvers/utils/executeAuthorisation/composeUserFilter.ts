import { EntityFilters, FilterArg } from '../../../tsTypes';

const composeUserFilter = (
  entityName: string,
  userAttributes: Record<string, any>,
  filters: EntityFilters,
  useInNodeAuthorisation = false,
) => {
  const { roles, ...rest } = userAttributes;

  const result = [];

  if (useInNodeAuthorisation && !filters[entityName][0]) {
    return null;
  }

  for (let j = 0; j < roles.length; j += 1) {
    const role = roles[j];

    const arg = { ...rest, role } as FilterArg;

    const filter = filters[entityName][1](arg);

    if (filter) {
      if (filter.length === 0) {
        return [];
      }

      result.push(...filter);
    }
  }

  return result.length > 0 ? result : null;
};

export default composeUserFilter;
