import type { Report } from '@/resolvers/tsTypes';

const report: Report = async (resolverCreatorArg, resolverArg) => {
  const { entityConfig } = resolverCreatorArg;
  const {
    context,
    resolverOptions: { involvedFilters },
  } = resolverArg;
  const { name } = entityConfig;

  const { subscribeDeletedFilterAndLimit: filter } = involvedFilters;

  const result = filter
    ? ({ previous: [previous] }) => {
        const { pubsub } = context;

        if (pubsub === undefined) {
          throw new TypeError(
            `PubSub not found! If you don't use "Subscription" exclude it in "inventory"!`,
          );
        }

        pubsub.publish(`deleted-${name}`, { [`deleted${name}`]: previous });
      }
    : null;

  return result;
};

export default report;
