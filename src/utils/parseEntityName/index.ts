import type { GeneralConfig } from '@/tsTypes';

import composeRepresentationConfigName from '../composeRepresentationConfig/composeRepresentationConfigName';

const store = Object.create(null);

const parseEntityName = (
  entityConfigName: string,
  generalConfig: GeneralConfig,
): {
  root: string;
  representationKey: string;
} => {
  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store[entityConfigName]) {
    return store[entityConfigName];
  }

  const { allEntityConfigs, representation } = generalConfig;
  if (allEntityConfigs[entityConfigName]) {
    store[entityConfigName] = { root: entityConfigName, representationKey: '' };
    return store[entityConfigName];
  }

  if (!representation)
    throw new TypeError('"representation" attribute of generalConfig must be setted!');

  const results = Object.keys(representation).reduce<Array<any>>((prev, representationKey) => {
    const root = entityConfigName.replace(representationKey, '');

    if (
      root !== entityConfigName &&
      allEntityConfigs[root] &&
      entityConfigName ===
        composeRepresentationConfigName(
          root,
          representationKey,
          allEntityConfigs[root].representationNameSlicePosition,
        )
    ) {
      prev.push({ root, representationKey });
    }

    return prev;
  }, []);

  if (!results.length) {
    throw new TypeError(
      `Not found representationKey for "${entityConfigName}" representation config name!`,
    );
  }

  if (results.length > 1) {
    throw new TypeError(
      `Found more than 1 representationKeys: ${results
        .map(({ representationKey }) => representationKey)
        .join(', ')} for "${entityConfigName}" representation config name!`,
    );
  }

  const [result] = results;

  const { root: rootEntityName, representationKey } = result;

  if (!representation[representationKey].allow[rootEntityName]) {
    throw new TypeError(
      `Not allow representationKey: ${representationKey} for "${rootEntityName}" entity name!`,
    );
  }

  store[entityConfigName] = result;

  return store[entityConfigName];
};

export default parseEntityName;
