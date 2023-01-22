// @flow

import type { EntityConfig } from '../../flowTypes';

const getTangibleEntities = (
  entityConfig: EntityConfig,
  result: Array<string> = [],
): Array<string> => {
  const { childFields = [], name, type: configType } = entityConfig;

  if (configType === 'tangible') {
    if (!result.includes(name)) {
      result.push(name);
    }
  } else {
    childFields.forEach(({ config }) => {
      getTangibleEntities(config, result);
    });
  }

  return result;
};

export default getTangibleEntities;
