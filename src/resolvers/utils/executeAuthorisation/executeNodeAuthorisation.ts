import type { FilterArg, GeneralConfig, ServersideConfig } from '../../../tsTypes';
import getPersonalFilter from './getPersonalFilter';

import injectStaticOrPersonalFilter from './injectStaticOrPersonalFilter';

const executeNodeAuthorisation = async (
  entityName: string,
  context: any,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Promise<null | Array<any>> => {
  const { filters, getUserAttributes, personalFilters = {}, staticFilters = {} } = serversideConfig;

  const personalFilter = personalFilters[entityName]
    ? await getPersonalFilter(personalFilters[entityName], context, generalConfig, serversideConfig)
    : undefined;

  if (personalFilter === null) {
    return null;
  }

  if (!filters) {
    const filter = staticFilters[entityName] ? [staticFilters[entityName]] : [];

    const involvedFilters = personalFilter
      ? [injectStaticOrPersonalFilter(personalFilter, filter)]
      : [filter];

    return involvedFilters;
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
      if (filter.length === 0) {
        const involvedFilters = staticFilters[entityName] ? [[staticFilters[entityName]]] : [[]];

        return involvedFilters;
      }

      if (!result) {
        result = [];
      }

      result.push(...filter);
    }
  }

  if (!result) {
    return null;
  }

  const filter = staticFilters[entityName]
    ? injectStaticOrPersonalFilter(staticFilters[entityName], result)
    : result;

  return personalFilter ? [injectStaticOrPersonalFilter(personalFilter, filter)] : [filter];
};

export default executeNodeAuthorisation;
