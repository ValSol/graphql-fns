// @flow
import type { EntityConfig } from '../flowTypes';

type Result = { [EntityConfig]: Array<Object> };

const getRelations = (entityConfig: EntityConfig, entityConfigs: Array<EntityConfig>): Result => {
  const result = new Map();

  entityConfigs.forEach((currentEntityConfig) => {
    const { relationalFields, type: configType } = currentEntityConfig;
    if (relationalFields && configType === 'tangible') {
      const fields = relationalFields
        .filter(({ config }) => config === entityConfig)
        .map(({ name, array }) => ({ name, array }));
      if (fields.length) {
        result.set(currentEntityConfig, fields);
      }
    }
  });
  return result;
};

export default getRelations;
