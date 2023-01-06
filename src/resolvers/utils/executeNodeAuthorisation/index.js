// @flow

import type { ServersideConfig } from '../../../flowTypes';

const executeNodeAuthorisation = async (
  entityName: string,
  context: Object,
  serversideConfig: ServersideConfig,
): Promise<null | Array<Object>> => {
  const { filters, getUserAttributes } = serversideConfig;

  if (!filters) {
    return [];
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

    const filter = filters[entityName]({ ...userAttributes, role });

    if (filter) {
      if (!filter.length) {
        return [];
      }

      if (!result) {
        result = [];
      }

      result.push(...filter);
    } else {
      result = null;
    }
  }

  return result;
};

export default executeNodeAuthorisation;
