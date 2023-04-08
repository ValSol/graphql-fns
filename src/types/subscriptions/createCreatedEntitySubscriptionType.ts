import type {EntityConfig} from '../../tsTypes';

const createCreatedEntitySubscriptionType = (entityConfig: EntityConfig): string => {
  const { name } = entityConfig;

  return `  created${name}(where: ${name}WhereInput): ${name}!`;
};

export default createCreatedEntitySubscriptionType;
