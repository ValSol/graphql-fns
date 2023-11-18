import type { GeneralConfig } from '../tsTypes';

import composeDescendantConfigByName from '../utils/composeDescendantConfigByName';
import fillEntityTypeDic from './fillEntityTypeDic';

// !!! have to use after all other functions that fill "entityTypeDic"

const processManualyUsedEntities = (
  generalConfig: GeneralConfig,
  entityTypeDic: { [entityName: string]: string },
  inputDic: { [inputName: string]: string },
) => {
  const { allEntityConfigs, manualyUsedEntities = [] } = generalConfig;

  if (manualyUsedEntities.length === 0) {
    return;
  }

  manualyUsedEntities.forEach(({ name: rootName, descendantKey }) => {
    const rootConfig = allEntityConfigs[rootName];

    if (rootConfig === undefined) {
      throw new TypeError(`Entity "${rootName}" not found in "allEntityConfigs"!`);
    }

    const config = descendantKey
      ? composeDescendantConfigByName(descendantKey, rootConfig, generalConfig)
      : rootConfig;

    const { name } = config;

    if (entityTypeDic[name]) {
      throw new TypeError(`Found redundant entity "${name}" in "manualyUsedEntities"!`);
    }

    fillEntityTypeDic(config, generalConfig, entityTypeDic, inputDic);
  });
};

export default processManualyUsedEntities;
