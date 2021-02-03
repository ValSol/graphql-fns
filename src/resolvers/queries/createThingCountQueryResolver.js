// @flow

import type { GeneralConfig, NearInput, ServersideConfig, ThingConfig } from '../../flowTypes';

import checkInventory from '../../utils/checkInventory';
import createThing from '../../mongooseModels/createThing';
import executeAuthorisation from '../executeAuthorisation';
import mergeWhereAndFilter from '../mergeWhereAndFilter';
import composeNearForAggregateInput from './composeNearForAggregateInput';

type Args = {
  where?: Object,
  near?: NearInput,
  search?: string,
};
type Context = { mongooseConn: Object };

const createThingCountQueryResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): Function => {
  const { enums, inventory } = generalConfig;
  const { name } = thingConfig;
  const inventoryChain = ['Query', 'thingCount', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (
    parent: Object,
    args: Args,
    context: Context,
    info: Object,
    parentFilter: Object,
  ): Object => {
    const filter = inAnyCase
      ? parentFilter
      : await executeAuthorisation(inventoryChain, context, serversideConfig);
    if (!filter) return null;

    const { near, where, search } = args;

    const { mongooseConn } = context;

    const Thing = await createThing(mongooseConn, thingConfig, enums);

    const { lookups, where: conditions } = mergeWhereAndFilter(filter, where, thingConfig) || {};

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

      const [{ count }] = await Thing.aggregate(arg).exec();

      return count;
    }

    const result = await Thing.countDocuments(conditions);

    return result;
  };

  return resolver;
};

export default createThingCountQueryResolver;
