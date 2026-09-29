import type { ServersideConfig, UserAttributes } from '@/tsTypes';

import createObjectBoundStore from '@/utils/createObjectBoundStore';

// promises are cached separately for every "getUserAttributes" callback & request "context" object...
// ... and token (as string key), so all resolvers of one request (including field resolvers...
// ... of children) call "getUserAttributes" only once
const getStore = createObjectBoundStore<Promise<UserAttributes>>();

// every user with "roles" (the guest included) has to have "id" of a User record...
// ... "personalFilters" rely on it, so its absence is a configuration error
const checkUserAttributes = (userAttributes: UserAttributes) => {
  if (userAttributes && !userAttributes.id) {
    throw new TypeError(
      `Not found "id" in attributes returned by "getUserAttributes" for roles: ${JSON.stringify(
        userAttributes.roles,
      )}!`,
    );
  }

  return userAttributes;
};

const getUserAttributesOnce = (
  getUserAttributes: ServersideConfig['getUserAttributes'],
  context: any,
  token?: string,
): null | Promise<UserAttributes> => {
  if (!getUserAttributes) return null;

  // without object "context" it is impossible to bind cache to a request
  if (!context || (typeof context !== 'object' && typeof context !== 'function')) {
    return getUserAttributes(context, token).then(checkUserAttributes);
  }

  const store = getStore(getUserAttributes, context);

  const key = token === undefined || token === null ? '' : `token:${token}`;

  if (!store[key]) {
    store[key] = Promise.resolve()
      .then(() => getUserAttributes(context, token))
      .then(checkUserAttributes)
      .catch((err) => {
        // do not cache failures to allow retry in following resolvers
        delete store[key];

        throw err;
      });
  }

  return store[key];
};

export default getUserAttributesOnce;
