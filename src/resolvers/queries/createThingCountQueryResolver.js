// @flow

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../flowTypes';

import authorize from '../../utils/authorize';
import checkInventory from '../../utils/checkInventory';
import createThingSchema from '../../mongooseModels/createThingSchema';

type Args = {
  where?: Object,
};
type Context = { mongooseConn: Object };

const createThingCountQueryResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Function => {
  const { enums, inventory } = generalConfig;
  const { authData, getCredentials, unrestricted } = serversideConfig;
  const { name } = thingConfig;
  const inventoryChain = ['Query', 'thingCount', name];
  if (!checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (_: Object, args: Args, context: Context): Object => {
    if (getCredentials && !(unrestricted && checkInventory(inventoryChain, unrestricted))) {
      const credentials = await getCredentials(context);
      // because qeury return scalar not use: Object.keys(getProjectionFromInfo(info)) ...
      const fields = ['foo']; // and use fake 'boo' field to check fields

      const authorized = await authorize(inventoryChain, fields, credentials, args, authData);
      if (!authorized) {
        throw new TypeError('Athorize Error!');
      }
    }
    const { where } = args;

    const { mongooseConn } = context;

    const thingSchema = createThingSchema(thingConfig, enums);

    const Thing = mongooseConn.model(name, thingSchema);
    const conditions = where || {};

    const result = await Thing.countDocuments(conditions);

    return result;
    /*
    const query = Thing.countDocuments(conditions);

    const things = await query.exec();
    if (!things) return [];

    const result = things.map(item => {
      const { _id } = item;
      return { ...item, id: _id };
    });

    return result;
    */
  };

  return resolver;
};

export default createThingCountQueryResolver;
