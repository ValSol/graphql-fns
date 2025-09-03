import type { Report } from '@/resolvers/tsTypes';

const report: Report = async (resolverCreatorArg, resolverArg) => {
  const { entityConfig } = resolverCreatorArg;
  const {
    context,
    resolverOptions: { subscriptionEntityNames },
  } = resolverArg;
  const { name } = entityConfig;

  const { subscriptionCreatedEntityName } = subscriptionEntityNames || {};

  const result = subscriptionCreatedEntityName
    ? ({ current: [current] }) => {
        const { pubsub } = context;

        if (pubsub === undefined) {
          throw new TypeError(
            `PubSub not found! If you don't use "Subscription" exclude it in "inventory"!`,
          );
        }

        pubsub.publish(`created-${name}`, { [`created${name}`]: current });
      }
    : null;

  return result;
};

export default report;
