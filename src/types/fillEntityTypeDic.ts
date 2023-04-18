import type { EntityConfig, GeneralConfig, Inventory } from '../tsTypes';

import checkInventory from '../utils/inventory/checkInventory';
import parseEntityName from '../utils/parseEntityName';
import childEntitiesThroughConnectionQuery from './actionAttributes/childEntitiesThroughConnectionQueryAttributes';
import createEntityType from './createEntityType';

const fillEntityTypeDic = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  entityTypeDic: { [entityName: string]: string },
  inputDic: { [inputName: string]: string },
  inventory?: Inventory,
) => {
  const {
    embeddedFields = [],
    childFields = [],
    duplexFields = [],
    fileFields = [],
    relationalFields = [],
    name,
  } = entityConfig as any;
  const { allEntityConfigs } = generalConfig;

  const { actionReturnConfig } = childEntitiesThroughConnectionQuery;

  if (!entityTypeDic[name]) {
    // eslint-disable-next-line no-param-reassign
    entityTypeDic[name] = createEntityType(
      entityConfig,
      generalConfig,
      entityTypeDic,
      inputDic,
      inventory,
    );
  }

  [...embeddedFields, ...childFields, ...duplexFields, ...fileFields, ...relationalFields].forEach(
    ({ config }) => {
      if (!entityTypeDic[config.name]) {
        fillEntityTypeDic(config, generalConfig, entityTypeDic, inputDic, inventory);
      }
    },
  );

  [...duplexFields, ...relationalFields].forEach(({ config }) => {
    if (!checkInventory(['Query', 'childEntitiesThroughConnection', config.name], inventory))
      return;

    const { root: rootName, descendantKey } = parseEntityName(config.name, generalConfig);

    const config2 = actionReturnConfig(allEntityConfigs[rootName], generalConfig, descendantKey);

    if (config2 && !entityTypeDic[config2.name]) {
      fillEntityTypeDic(config2, generalConfig, entityTypeDic, inputDic, inventory);
    }
  });

  [...embeddedFields, ...fileFields].forEach(({ config }) => {
    const { root: rootName, descendantKey } = parseEntityName(config.name, generalConfig);

    const config2 = actionReturnConfig(allEntityConfigs[rootName], generalConfig, descendantKey);

    if (config2 && !entityTypeDic[config2.name]) {
      fillEntityTypeDic(config2, generalConfig, entityTypeDic, inputDic, inventory);
    }
  });
};

export default fillEntityTypeDic;
