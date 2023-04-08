import type { FilterArg, ServersideConfig } from '../../../tsTypes';

import injectStaticFilter from './injectStaticFilter';

const executeNodeAuthorisation = async (
  entityName: string,
  context: any,
  serversideConfig: ServersideConfig,
): Promise<null | Array<any>> => {
  const { filters, getUserAttributes, staticFilters = {} } = serversideConfig;

  if (!filters) {
    return [staticFilters[entityName]] || [];
  }

  if (!getUserAttributes) {
    throw new TypeError('Not found "getUserAttributes" callback!');
  }

  if (!filters[entityName]) {
    throw new TypeError(`Not found "filter" for entityName: "${entityName}"!`);
  }

  const userAttributes = await getUserAttributes(context);

  const { roles, ...userAttributesRest } = userAttributes;

  let result = null;

  for (let j = 0; j < roles.length; j += 1) {
    const role = roles[j];

    const arg = { ...userAttributesRest, role } as FilterArg;

    // only if entity also used as "output" entity use corresponding filter
    const filter = filters[entityName][0] && filters[entityName][1](arg);

    if (filter) {
      if (!filter.length) {
        return staticFilters[entityName] ? [staticFilters[entityName]] : [];
      }

      if (!result) {
        result = [];
      }

      result.push(...filter);
    }
  }

  return result && staticFilters[entityName]
    ? injectStaticFilter(staticFilters[entityName], result)
    : result;
};

export default executeNodeAuthorisation;
