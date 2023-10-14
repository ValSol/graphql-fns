import { TangibleEntityConfig } from '../../../../tsTypes';
import type { Report } from '../../../tsTypes';

import addCalculatedFieldsToEntity from '../../../utils/addCalculatedFieldsToEntity';
import addIdsToEntity from '../../../utils/addIdsToEntity';
import getAsyncFuncResults from '../../../utils/getAsyncFuncResults';
import getProjectionFromInfo from '../../../utils/getProjectionFromInfo';

const report: Report = async (resolverCreatorArg, resolverArg) => {
  const { entityConfig } = resolverCreatorArg;
  const { args, context, involvedFilters } = resolverArg;
  const { name } = entityConfig;

  const { data } = args;

  const { subscribeUpdatedEntity: filter } = involvedFilters;

  const result = filter
    ? async ({ previous: [previous], current: [current] }) => {
        const { pubsub } = context;
        if (!pubsub) throw new TypeError('Context have to have pubsub for subscription!'); // to prevent flowjs error
        const updatedFields = Object.keys(data);

        const projection = getProjectionFromInfo(entityConfig as TangibleEntityConfig, resolverArg);

        const asyncFuncResults = await getAsyncFuncResults(
          projection,
          resolverArg,
          entityConfig as TangibleEntityConfig,
        );

        const payload = {
          node: current,
          previousNode: addCalculatedFieldsToEntity(
            addIdsToEntity(previous, entityConfig),
            projection,
            asyncFuncResults,
            resolverArg,
            entityConfig as TangibleEntityConfig,
          ),
          updatedFields,
        } as const;
        pubsub.publish(`updated-${name}`, { [`updated${name}`]: payload });
      }
    : null;

  return result;
};

export default report;
