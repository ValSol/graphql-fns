// @flow

import type { ServersideConfig } from '../../../flowTypes';

import injectStaticFilter from './injectStaticFilter';

const executeNodeAuthorisation = async (
  entityName: string,
  context: Object,
  serversideConfig: ServersideConfig,
): Promise<null | Array<Object>> => {
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

  const { roles } = userAttributes;

  let result = null;

  for (let j = 0; j < roles.length; j += 1) {
    const role = roles[j];

    // only if entity also used as "output" entity use corresponding filter
    const filter = filters[entityName][0] && filters[entityName][1]({ ...userAttributes, role });

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
