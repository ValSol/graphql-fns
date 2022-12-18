// @flow

import type { EntityConfig } from '../flowTypes';

import createEntityType from './createEntityType';

const fillEntityTypeDic = (
  entityConfig: EntityConfig,
  entityTypeDic: { [entityName: string]: string },
  inputDic: { [inputName: string]: string },
) => {
  const {
    embeddedFields = [],
    childFields = [],
    duplexFields = [],
    relationalFields = [],
    name,
  } = entityConfig;

  entityTypeDic[name] = createEntityType(entityConfig, inputDic); // eslint-disable-line no-param-reassign

  [...embeddedFields, ...childFields, ...duplexFields, ...relationalFields].forEach(
    ({ config }) => {
      if (!entityTypeDic[config.name]) {
        fillEntityTypeDic(config, entityTypeDic, inputDic);
      }
    },
  );
};

export default fillEntityTypeDic;
