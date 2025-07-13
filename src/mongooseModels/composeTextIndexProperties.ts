import type { EntityConfig } from '../tsTypes';

const composeTextIndexProperties = (
  entityConfig: EntityConfig,
  parent = '',
): {
  [key: string]: number;
} => {
  const { embeddedFields = [], textFields = [] } = entityConfig;

  const result = textFields.reduce<Record<string, any>>((prev, { name, weight }) => {
    if (weight) {
      prev[`${parent}${name}`] = weight;
    }

    return prev;
  }, {});

  embeddedFields.reduce((prev, { name, config }) => {
    const result2 = composeTextIndexProperties(config, `${parent}${name}.`);

    Object.keys(result2).forEach((key) => {
      prev[key] = result2[key];
    });

    return prev;
  }, result);

  return result;
};

export default composeTextIndexProperties;
