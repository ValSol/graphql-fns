import type { GeneralConfig, ServersideConfig } from '../../../../tsTypes';
import composePersonalFilter from '../composePersonalFilter';
import composeUserFilter from '../composeUserFilter';
import getUserAttributesOnce from '../getUserAttributesOnce';

import injectStaticOrPersonalFilter from '../injectStaticOrPersonalFilter';

const executeNodeAuthorisation = async (
  entityName: string,
  context: any,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Promise<null | Array<any>> => {
  const {
    containedRoles,
    filters,
    getUserAttributes,
    personalFilters = {},
    staticFilters = {},
  } = serversideConfig;

  const userAttributes = await getUserAttributesOnce(getUserAttributes, context);

  const personalFilter = personalFilters[entityName]
    ? await composePersonalFilter(
        entityName,
        userAttributes,
        context,
        generalConfig,
        serversideConfig,
      )
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

  if (!userAttributes) {
    throw new TypeError(
      `Not found ${getUserAttributes ? '"getUserAttributes" callback' : '"userAttributes"'}!`,
    );
  }

  if (!filters[entityName]) {
    throw new TypeError(`Not found "filter" for entityName: "${entityName}"!`);
  }

  // roles absent in "containedRoles" (unknown for config) are ignored & don't give any access
  const userAttributes2 = containedRoles
    ? { ...userAttributes, roles: userAttributes.roles.filter((role) => containedRoles[role]) }
    : userAttributes;

  const result = composeUserFilter(entityName, userAttributes2, filters, true);

  if (!result) {
    return result;
  }

  const filter = staticFilters[entityName]
    ? injectStaticOrPersonalFilter(staticFilters[entityName], result)
    : result;

  return personalFilter ? [injectStaticOrPersonalFilter(personalFilter, filter)] : [filter];
};

export default executeNodeAuthorisation;
