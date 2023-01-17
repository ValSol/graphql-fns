// @flow

import type { Report } from '../../../flowTypes';

import addIdsToEntity from '../../../utils/addIdsToEntity';

const report: Report = async (resolverCreatorArg, resolverArg) => {
  const { entityConfig } = resolverCreatorArg;
  const { args, context, involvedFilters } = resolverArg;
  const { name } = entityConfig;

  const { data } = args;

  const { subscribeUpdatedEntity: filter } = involvedFilters;

  const result = filter
    ? ({ previous: [previous], current: [current] }) => {
        const { pubsub } = context;
        if (!pubsub) throw new TypeError('Context have to have pubsub for subscription!'); // to prevent flowjs error
        const updatedFields = Object.keys(data);

        const payload = {
          node: current,
          previousNode: addIdsToEntity(previous, entityConfig),
          updatedFields,
        };
        pubsub.publish(`updated-${name}`, { [`updated${name}`]: payload });
      }
    : null;

  return result;
};

export default report;
