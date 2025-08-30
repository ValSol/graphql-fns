import type { GeneralConfig } from '@/tsTypes';

import composeDescendantConfigName from '../composeDescendantConfig/composeDescendantConfigName';

const store = Object.create(null);

const parseEntityName = (
  entityConfigName: string,
  generalConfig: GeneralConfig,
): {
  root: string;
  descendantKey: string;
} => {
  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store[entityConfigName]) {
    return store[entityConfigName];
  }

  const { allEntityConfigs, descendant } = generalConfig;
  if (allEntityConfigs[entityConfigName]) {
    store[entityConfigName] = { root: entityConfigName, descendantKey: '' };
    return store[entityConfigName];
  }

  if (!descendant) throw new TypeError('"descendant" attribute of generalConfig must be setted!');

  const results = Object.keys(descendant).reduce<Array<any>>((prev, descendantKey) => {
    const root = entityConfigName.replace(descendantKey, '');

    if (
      root !== entityConfigName &&
      allEntityConfigs[root] &&
      entityConfigName ===
        composeDescendantConfigName(
          root,
          descendantKey,
          allEntityConfigs[root].descendantNameSlicePosition,
        )
    ) {
      prev.push({ root, descendantKey });
    }

    return prev;
  }, []);

  if (!results.length) {
    throw new TypeError(
      `Not found descendantKey for "${entityConfigName}" descendant config name!`,
    );
  }

  if (results.length > 1) {
    throw new TypeError(
      `Found more than 1 descendantKeys: ${results
        .map(({ descendantKey }) => descendantKey)
        .join(', ')} for "${entityConfigName}" descendant config name!`,
    );
  }

  const [result] = results;

  const { root: rootEntityName, descendantKey } = result;

  if (!descendant[descendantKey].allow[rootEntityName]) {
    throw new TypeError(
      `Not allow descendantKey: ${descendantKey} for "${rootEntityName}" entity name!`,
    );
  }

  store[entityConfigName] = result;

  return store[entityConfigName];
};

export default parseEntityName;
