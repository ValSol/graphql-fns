// @flow

import type { Report } from '../../../flowTypes';

const report: Report = async (resolverCreatorArg, resolverArg) => {
  const { entityConfig } = resolverCreatorArg;
  const { context, parentFilters } = resolverArg;
  const { name } = entityConfig;

  const { subscribeCreatedEntity: filter } = parentFilters;

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
