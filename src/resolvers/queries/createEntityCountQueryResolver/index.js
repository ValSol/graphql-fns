// @flow

import type { GeneralConfig, NearInput, ServersideConfig, EntityConfig } from '../../../flowTypes';
import type { Context } from '../../flowTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createMongooseModel from '../../../mongooseModels/createMongooseModel';
import composeNearForAggregateInput from '../../utils/composeNearForAggregateInput';
import mergeWhereAndFilter from '../../utils/mergeWhereAndFilter';

type Args = {
  where?: Object,
  near?: NearInput,
  search?: string,
};

const createEntityCountQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): Function => {
  const { enums, inventory } = generalConfig;
  const { name } = entityConfig;
  const inventoryChain = ['Query', 'entityCount', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (
    parent: Object,
    args: Args,
    context: Context,
    info: Object,
    involvedFilters: { [derivativeConfigName: string]: Array<Object> },
  ): Object => {
    const { inputOutputEntity: filter } = involvedFilters;

    if (!filter) return null;

    const { near, where, search } = args;

    const { mongooseConn } = context;

    const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

    const { lookups, where: conditions } = mergeWhereAndFilter(filter, where, entityConfig) || {};

    if (lookups.length || near || search) {
      const arg = [...lookups];

      if (near) {
        const geoNear = composeNearForAggregateInput(near);

        arg.unshift({ $geoNear: geoNear });
      }

      if (search) {
        arg.unshift({ $match: { $text: { $search: search } } });
      }

      if (Object.keys(conditions).length) {
        arg.push({ $match: conditions });
      }

      arg.push({ $count: 'count' });

      const [{ count }] = await Entity.aggregate(arg).exec();

      return count;
    }

    const result = await Entity.countDocuments(conditions);

    return result;
  };

  return resolver;
};

export default createEntityCountQueryResolver;
