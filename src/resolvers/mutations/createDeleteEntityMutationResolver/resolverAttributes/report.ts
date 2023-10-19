import type { Report } from '../../../tsTypes';

const report: Report = async (resolverCreatorArg, resolverArg) => {
  const { entityConfig } = resolverCreatorArg;
  const { context, involvedFilters } = resolverArg;
  const { name } = entityConfig;

  const { subscribeDelatedEntity: filter } = involvedFilters;

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
