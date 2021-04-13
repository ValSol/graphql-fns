// @flow

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../flowTypes';

import checkInventory from '../../utils/checkInventory';
import createThing from '../../mongooseModels/createThing';
import executeAuthorisation from '../executeAuthorisation';
import mergeWhereAndFilter from '../mergeWhereAndFilter';

type Args = {
  where?: Object,
  options: { target: string },
};
type Context = { mongooseConn: Object };

const createThingDistinctValuesQueryResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): Function => {
  const { enums, inventory } = generalConfig;
  const { name } = thingConfig;
  const inventoryChain = ['Query', 'thingDistinctValues', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (
    parent: Object,
    args: Args,
    context: Context,
    info: Object,
    parentFilter: Array<Object>,
  ): Object => {
    const filter = inAnyCase
      ? parentFilter
      : await executeAuthorisation(inventoryChain, context, serversideConfig);
    if (!filter) return null;

    const {
      where,
      options: { target },
    } = args;

    const { mongooseConn } = context;

    const Thing = await createThing(mongooseConn, thingConfig, enums);

    const { lookups, where: conditions } = mergeWhereAndFilter(filter, where, thingConfig) || {};

    if (lookups.length) {
      const arg = [...lookups];

      if (Object.keys(conditions).length) {
        arg.push({ $match: conditions });
      }

      arg.push({ $project: { _id: 1 } });

      const ids = await Thing.aggregate(arg).exec();

      const result = await Thing.distinct(target, { _id: { $in: ids } });

      return result.filter(Boolean);
    }

    const result = await Thing.distinct(target, conditions);

    return result.filter(Boolean);
  };

  return resolver;
};

export default createThingDistinctValuesQueryResolver;
