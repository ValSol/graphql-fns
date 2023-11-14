import type { EntityConfig, GeneralConfig } from '../tsTypes';

import parseEntityName from '../utils/parseEntityName';
import childEntitiesThroughConnectionQuery from './actionAttributes/childEntitiesThroughConnectionQueryAttributes';
import createEntityType from './createEntityType';

const all = [];

const fillEntityTypeDic = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  entityTypeDic: { [entityName: string]: string },
  inputDic: { [inputName: string]: string },
) => {
  const {
    embeddedFields = [],
    childFields = [],
    duplexFields = [],
    filterFields = [],
    fileFields = [],
    relationalFields = [],
    name,
  } = entityConfig as any;

  const { allEntityConfigs } = generalConfig;

  const { actionReturnConfig } = childEntitiesThroughConnectionQuery;

  if (!entityTypeDic[name]) {
    // use "temporary string" to prevent an endless cycle that couse an error "RangeError: Maximum call stack size exceeded"
    entityTypeDic[name] = 'temporary string';

    entityTypeDic[name] = createEntityType(entityConfig, generalConfig, entityTypeDic, inputDic);
  }

  [
    ...embeddedFields,
    ...childFields,
    ...duplexFields,
    ...filterFields,
    ...fileFields,
    ...relationalFields,
  ].forEach(({ config }) => {
    if (!entityTypeDic[config.name]) {
      fillEntityTypeDic(config, generalConfig, entityTypeDic, inputDic);
    }
  });

  [...embeddedFields, ...fileFields].forEach(({ config }) => {
    const { root: rootName, descendantKey } = parseEntityName(config.name, generalConfig);

    const config2 = actionReturnConfig(allEntityConfigs[rootName], generalConfig, descendantKey);

    if (config2 && !entityTypeDic[config2.name]) {
      fillEntityTypeDic(config2, generalConfig, entityTypeDic, inputDic);
    }
  });
};

export default fillEntityTypeDic;
