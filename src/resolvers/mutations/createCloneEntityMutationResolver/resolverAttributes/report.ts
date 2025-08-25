import { TangibleEntityConfig } from '@/tsTypes';
import type { Report } from '@/resolvers/tsTypes';

import addCalculatedFieldsToEntity from '@/resolvers/utils/addCalculatedFieldsToEntity';
import addIdsToEntity from '@/resolvers/utils/addIdsToEntity';
import getAsyncFuncResults from '@/resolvers/utils/getAsyncFuncResults';
import getInfoEssence from '@/resolvers/utils/getInfoEssence';

const report: Report = async (resolverCreatorArg, resolverArg) => {
  const { entityConfig } = resolverCreatorArg;
  const {
    args,
    context,
    info,
    resolverOptions: { involvedFilters },
  } = resolverArg;
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

        const infoEssence = getInfoEssence(entityConfig as TangibleEntityConfig, info);

        const asyncFuncResults = await getAsyncFuncResults(
          infoEssence,
          resolverCreatorArg,
          resolverArg,
        );

        const payload = {
          node: current,
          previousNode: addCalculatedFieldsToEntity(
            addIdsToEntity(previous, entityConfig),
            infoEssence,
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
