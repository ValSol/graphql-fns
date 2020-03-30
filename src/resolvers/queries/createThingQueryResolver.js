// @flow

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../flowTypes';

import checkInventory from '../../utils/checkInventory';
import createThingSchema from '../../mongooseModels/createThingSchema';
import addIdsToThing from '../addIdsToThing';
import executeAuthorisation from '../executeAuthorisation';
import getProjectionFromInfo from '../getProjectionFromInfo';

type Args = { whereOne: { id: string } };
type Context = { mongooseConn: Object };

const createThingQueryResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Function | null => {
  const { enums, inventory } = generalConfig;
  const { name } = thingConfig;

  const inventoryChain = ['Query', 'thing', name];
  if (!checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (parent: Object, args: Args, context: Context, info: Object): Object => {
    const resolverArgs = { parent, args, context, info };
    await executeAuthorisation({
      inventoryChain,
      resolverArgs,
      serversideConfig,
    });

    const { whereOne } = args;

    const { mongooseConn } = context;

    const thingSchema = createThingSchema(thingConfig, enums);

    const Thing = mongooseConn.model(`${name}_Thing`, thingSchema);

    const whereOneKeys = Object.keys(whereOne);
    if (whereOneKeys.length !== 1) {
      throw new TypeError('Expected exactly one key in whereOne arg!');
    }
    const conditions = whereOne.id ? { _id: whereOne.id } : whereOne;

    const projection = info ? getProjectionFromInfo(info) : { _id: 1 };

    const thing = await Thing.findOne(conditions, projection, { lean: true });
    if (!thing) return null;

    const thing2 = addIdsToThing(thing, thingConfig);
    return thing2;
  };

  return resolver;
};

export default createThingQueryResolver;
