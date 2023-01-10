// @flow
import type { GeneralConfig } from '../../flowTypes';

import composeDerivativeConfigName from '../composeDerivativeConfig/composeDerivativeConfigName';

const store = Object.create(null);

const parseEntityName = (
  entityConfigName: string,
  generalConfig: GeneralConfig,
): { root: string, derivativeKey: string } => {
  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store[entityConfigName]) {
    return store[entityConfigName];
  }

  const { allEntityConfigs, derivative } = generalConfig;
  if (allEntityConfigs[entityConfigName]) {
    store[entityConfigName] = { root: entityConfigName, derivativeKey: '' };
    return store[entityConfigName];
  }

  if (!derivative) throw new TypeError('"derivative" attribute of generalConfig must be setted!');

  const results = Object.keys(derivative).reduce((prev, derivativeKey) => {
    const root = entityConfigName.replace(derivativeKey, '');

    if (
      root !== entityConfigName &&
      allEntityConfigs[root] &&
      entityConfigName ===
        composeDerivativeConfigName(
          root,
          derivativeKey,
          allEntityConfigs[root].derivativeNameSlicePosition,
        )
    ) {
      prev.push({ root, derivativeKey });
    }

    return prev;
  }, []);

  if (!results.length) {
    throw new TypeError(
      `Not found derivativeKey for "${entityConfigName}" derivative config name!`,
    );
  }

  if (results.length > 1) {
    throw new TypeError(
      `Found more than 1 derivativeKeys: ${results
        .map(({ derivativeKey }) => derivativeKey)
        .join(', ')} for "${entityConfigName}" derivative config name!`,
    );
  }

  const [result] = results;

  const { root: rootEntityName, derivativeKey } = result;

  if (!derivative[derivativeKey].allow[rootEntityName]) {
    throw new TypeError(
      `Not allow derivativeKey: ${derivativeKey} for "${rootEntityName}" entity name!`,
    );
  }

  store[entityConfigName] = result;

  return store[entityConfigName];
};

export default parseEntityName;
