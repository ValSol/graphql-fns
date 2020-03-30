// @flow

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../flowTypes';

import checkInventory from '../../utils/checkInventory';
import createThingSchema from '../../mongooseModels/createThingSchema';
import addIdsToThing from '../addIdsToThing';
import executeAuthorisation from '../executeAuthorisation';
import getProjectionFromInfo from '../getProjectionFromInfo';

type Args = { where: { id: string } };
type Context = { mongooseConn: Object };

const createThingScalarResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Function => {
  const { inventory } = generalConfig;
  const { name } = thingConfig;

  const inventoryChain = ['Query', 'thing', name];
  if (!checkInventory(inventoryChain, inventory)) return () => null;

  const resolver = async (parent: Object, args: Args, context: Context, info: Object): Object => {
    const resolverArgs = { parent, args, context, info };
    await executeAuthorisation({
      inventoryChain,
      resolverArgs,
      serversideConfig,
    });

    const { enums } = generalConfig;
    const { fieldName } = info;

    const id = parent[fieldName];

    if (!id) return null;

    const { mongooseConn } = context;

    const thingSchema = createThingSchema(thingConfig, enums);

    const Thing = mongooseConn.model(`${name}_Thing`, thingSchema);
    const projection = getProjectionFromInfo(info);

    const thing = await Thing.findById(id, projection, { lean: true });

    if (!thing) return null; // if there's broken link

    const thing2 = addIdsToThing(thing, thingConfig);

    return thing2;
  };

  return resolver;
};

export default createThingScalarResolver;
