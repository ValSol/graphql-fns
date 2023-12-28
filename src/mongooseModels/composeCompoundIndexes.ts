import type { TangibleEntityConfig } from '../tsTypes';

const composeCompoundIndexes = (entityConfig: TangibleEntityConfig) => {
  const { uniqueCompoundIndexes = [] } = entityConfig;

  return uniqueCompoundIndexes.map((uniqueCompoundIndex) =>
    uniqueCompoundIndex.reduce((prev, fieldName) => {
      prev[fieldName] = 1;

      return prev;
    }, {}),
  );
};

export default composeCompoundIndexes;
