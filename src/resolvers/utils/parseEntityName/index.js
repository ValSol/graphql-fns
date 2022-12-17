// @flow
import type { GeneralConfig } from '../../../flowTypes';

import composeDerivativeConfigName from '../../../utils/composeDerivativeConfig/composeDerivativeConfigName';

const parseEntityName = (
  entityConfigName: string,
  generalConfig: GeneralConfig,
): { root: string, derivativeKey: string } => {
  const { allEntityConfigs, derivative } = generalConfig;
  if (allEntityConfigs[entityConfigName]) return { root: entityConfigName, derivativeKey: '' };

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

  return result;
};

export default parseEntityName;
