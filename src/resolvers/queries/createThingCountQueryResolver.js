// @flow

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../flowTypes';

import checkInventory from '../../utils/checkInventory';
import createThingSchema from '../../mongooseModels/createThingSchema';
import executeAuthorisation from '../executeAuthorisation';
import composeWhereInput from './composeWhereInput';

type Args = {
  where?: Object,
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

  const resolver = async (parent: Object, args: Args, context: Context): Object => {
    if (!(await executeAuthorisation(inventoryChain, context, serversideConfig))) return null;

    const { where } = args;

    const { mongooseConn } = context;

    const thingSchema = createThingSchema(thingConfig, enums);

    const Thing = mongooseConn.model(`${name}_Thing`, thingSchema);
    const conditions = composeWhereInput(where, thingConfig) || {};

    const result = await Thing.countDocuments(conditions);

    return result;
  };

  return resolver;
};

export default createThingCountQueryResolver;
