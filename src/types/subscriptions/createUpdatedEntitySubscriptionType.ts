import type { EntityConfig } from '@/tsTypes';

const createUpdatedEntitySubscriptionType = (entityConfig: EntityConfig): string => {
  const { name } = entityConfig;

  const subscriptionArgs = [`where: ${name}WhereInput`];

  const result = `  updated${name}(${subscriptionArgs.join(', ')}): Updated${name}Payload!`;

  return result;
};

export default createUpdatedEntitySubscriptionType;
