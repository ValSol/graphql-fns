import { string } from 'yup';
import type { EntityConfig } from '../tsTypes';

type Result = Map<EntityConfig, { name: string; array?: boolean }>;

const getRelations = (
  entityConfig: EntityConfig,
  allEntityConfigs: Array<EntityConfig>,
): Result => {
  const result = new Map();

  allEntityConfigs.forEach((currentEntityConfig) => {
    const { type: configType } = currentEntityConfig;
    if (configType === 'tangible') {
      const { relationalFields = [] } = currentEntityConfig;

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
