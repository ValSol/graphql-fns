// @flow

import type { EntityConfig, Inventory } from '../flowTypes';

import createEntityType from './createEntityType';

const fillEntityTypeDic = (
  entityConfig: EntityConfig,
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
  } = entityConfig;

  entityTypeDic[name] = createEntityType(entityConfig, inputDic, inventory); // eslint-disable-line no-param-reassign

  [...embeddedFields, ...childFields, ...duplexFields, ...fileFields, ...relationalFields].forEach(
    ({ config }) => {
      if (!entityTypeDic[config.name]) {
        fillEntityTypeDic(config, entityTypeDic, inputDic, inventory);
      }
    },
  );
};

export default fillEntityTypeDic;
