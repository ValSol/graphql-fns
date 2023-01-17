// @flow

import type { GeneralConfig, ServersideConfig, EntityConfig } from '../../../flowTypes';
import type { Context } from '../../flowTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createMongooseModel from '../../../mongooseModels/createMongooseModel';
import mergeWhereAndFilter from '../../utils/mergeWhereAndFilter';

type Args = {
  where?: Object,
  options: { target: string },
};

const createEntityDistinctValuesQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): Function => {
  const { enums, inventory } = generalConfig;
  const { name } = entityConfig;
  const inventoryChain = ['Query', 'entityDistinctValues', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (
    parent: Object,
    args: Args,
    context: Context,
    info: Object,
    involvedFilters: { [derivativeConfigName: string]: Array<Object> },
  ): Object => {
    const { inputEntity: filter } = involvedFilters;

    if (!filter) return null;

    const {
      where,
      options: { target },
    } = args;

    const { mongooseConn } = context;

    const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

    const { lookups, where: conditions } = mergeWhereAndFilter(filter, where, entityConfig) || {};

    if (lookups.length) {
      const arg = [...lookups];

      if (Object.keys(conditions).length) {
        arg.push({ $match: conditions });
      }

      arg.push({ $project: { _id: 1 } });

      const ids = await Entity.aggregate(arg).exec();

      const result = await Entity.distinct(target, { _id: { $in: ids } });

      return result.filter(Boolean);
    }

    const result = await Entity.distinct(target, conditions);

    return result.filter(Boolean);
  };

  return resolver;
};

export default createEntityDistinctValuesQueryResolver;
