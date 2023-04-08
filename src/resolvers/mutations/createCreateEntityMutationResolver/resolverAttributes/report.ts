import type {Report} from '../../../tsTypes';

const report: Report = async (resolverCreatorArg, resolverArg) => {
  const { entityConfig } = resolverCreatorArg;
  const { context, involvedFilters } = resolverArg;
  const { name } = entityConfig;

  const { subscribeCreatedEntity: filter } = involvedFilters;

  const result = filter
    ? ({ current: [current] }) => {
        const { pubsub } = context;
        if (!pubsub) throw new TypeError('Context have to have pubsub for subscription!'); // to prevent flowjs error
        pubsub.publish(`created-${name}`, { [`created${name}`]: current });
      }
    : null;

  return result;
};

export default report;
