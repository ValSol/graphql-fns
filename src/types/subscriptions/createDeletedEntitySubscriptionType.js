// @flow
import type { EntityConfig } from '../../flowTypes';

const createDeletedEntitySubscriptionType = (entityConfig: EntityConfig): string => {
  const { name } = entityConfig;

  return `  deleted${name}(where: ${name}WhereInput): ${name}!`;
};

export default createDeletedEntitySubscriptionType;
