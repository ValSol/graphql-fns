// @flow

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../flowTypes';

import checkInventory from '../../utils/checkInventory';
import createThingSchema from '../../mongooseModels/createThingSchema';
import executeAuthorisation from '../executeAuthorisation';
import getProjectionFromInfo from '../getProjectionFromInfo';

type Args = { where: { id: string } };
type Context = { mongooseConn: Object };

const createThingArrayResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Function => {
  const { inventory } = generalConfig;
  const { name } = thingConfig;

  const inventoryChain = ['Query', 'things', name];
  if (!checkInventory(inventoryChain, inventory)) return () => [];

  const resolver = async (parent: Object, args: Args, context: Context, info: Object): Object => {
    const resolverArgs = { parent, args, context, info };
    await executeAuthorisation({
      inventoryChain,
      resolverArgs,
      serversideConfig,
    });

    const { enums } = generalConfig;
    const { fieldName } = info;

    const ids = parent[fieldName];

    if (!ids || !ids.length) return [];

    const { mongooseConn } = context;

    const thingSchema = createThingSchema(thingConfig, enums);

    const Thing = mongooseConn.model(`${name}_Thing`, thingSchema);
    const projection = getProjectionFromInfo(info);

    const things = await Thing.find({ _id: { $in: ids } }, projection, { lean: true });

    const things2 = things.filter(Boolean).map((item) => ({
      ...item,
      id: item._id, // eslint-disable-line no-underscore-dangle
    }));

    return things2;
  };

  return resolver;
};

export default createThingArrayResolver;
