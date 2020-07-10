// @flow

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../flowTypes';

import checkInventory from '../../utils/checkInventory';
import createThingSchema from '../../mongooseModels/createThingSchema';
import executeAuthorisation from '../executeAuthorisation';
import mergeWhereAndFilter from '../mergeWhereAndFilter';

type Args = {
  where: Object,
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
    parentFilter: Object,
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

    const thingSchema = createThingSchema(thingConfig, enums);

    const Thing = mongooseConn.model(`${name}_Thing`, thingSchema);
    const conditions = mergeWhereAndFilter(filter, where, thingConfig) || {};

    const result = await Thing.distinct(target, conditions);

    return result.filter(Boolean);
  };

  return resolver;
};

export default createThingDistinctValuesQueryResolver;
