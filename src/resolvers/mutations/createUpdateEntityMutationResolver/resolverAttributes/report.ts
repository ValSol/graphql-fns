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

        if (pubsub === undefined) {
          throw new TypeError(
            `PubSub not found! If you don't use "Subscription" exclude it in "inventory"!`,
          );
        }

        const updatedFields = Object.keys(data);

        const projection = getProjectionFromInfo(entityConfig as TangibleEntityConfig, resolverArg);

        const asyncFuncResults = await getAsyncFuncResults(
          projection,
          resolverCreatorArg,
          resolverArg,
        );

        const payload = {
          node: current,
          previousNode: addCalculatedFieldsToEntity(
            addIdsToEntity(previous, entityConfig),
            projection,
            asyncFuncResults,
            resolverArg,
            entityConfig as TangibleEntityConfig,
            0, // index
          ),
          updatedFields,
        } as const;
        pubsub.publish(`updated-${name}`, { [`updated${name}`]: payload });
      }
    : null;

  return result;
};

export default report;
