import type { ServersideConfig, UserAttributes } from '@/tsTypes';

import createObjectBoundStore from '@/utils/createObjectBoundStore';

// promises are cached separately for every "getUserAttributes" callback & request "context" object...
// ... and token (as string key), so all resolvers of one request (including field resolvers...
// ... of children) call "getUserAttributes" only once
const getStore = createObjectBoundStore<Promise<UserAttributes>>();

const getUserAttributesOnce = (
  getUserAttributes: ServersideConfig['getUserAttributes'],
  context: any,
  token?: string,
): null | Promise<UserAttributes> => {
  if (!getUserAttributes) return null;

  // without object "context" it is impossible to bind cache to a request
  if (!context || (typeof context !== 'object' && typeof context !== 'function')) {
    return getUserAttributes(context, token);
  }

  const store = getStore(getUserAttributes, context);

  const key = token === undefined || token === null ? '' : `token:${token}`;

  if (!store[key]) {
    store[key] = Promise.resolve()
      .then(() => getUserAttributes(context, token))
      .catch((err) => {
        // do not cache failures to allow retry in following resolvers
        delete store[key];

        throw err;
      });
  }

  return store[key];
};

export default getUserAttributesOnce;
