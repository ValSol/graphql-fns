// @flow

import type { Report } from '../../../flowTypes';

const report: Report = async (resolverCreatorArg, resolverArg) => {
  const { entityConfig } = resolverCreatorArg;
  const { context, parentFilters } = resolverArg;
  const { name } = entityConfig;

  const { subscribeDelatedEntity: filter } = parentFilters;

  const result = filter
    ? ({ previous: [previous] }) => {
        const { pubsub } = context;
        if (!pubsub) throw new TypeError('Context have to have pubsub for subscription!'); // to prevent flowjs error
        pubsub.publish(`deleted-${name}`, { [`deleted${name}`]: previous });
      }
    : null;

  return result;
};

export default report;
