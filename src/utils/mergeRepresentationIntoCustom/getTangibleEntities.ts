import type { EntityConfig, VirtualEntityConfig } from '../../tsTypes';

const getTangibleEntities = (
  entityConfig: EntityConfig,
  result: Array<string> = [],
): Array<string> => {
  const { name, type: configType } = entityConfig;

  if (configType === 'tangible') {
    if (!result.includes(name)) {
      result.push(name);
    }
  } else if (configType === 'virtual') {
    const { childFields = [] } = entityConfig;

    childFields.forEach(({ config }) => {
      getTangibleEntities(config, result);
    });
  }

  return result;
};

export default getTangibleEntities;
