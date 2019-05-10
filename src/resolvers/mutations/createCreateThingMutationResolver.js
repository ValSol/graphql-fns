// @flow
import type { GeneralConfig, ThingConfig } from '../../flowTypes';

const checkInventory = require('../../utils/checkInventory');
const createThingSchema = require('../../mongooseModels/createThingSchema');
const processCreateInputData = require('./processCreateInputData');
const updatePeriphery = require('./updatePeriphery');

type Args = { data: Object };
type Context = { mongooseConn: Object };

const createCreateThingMutationResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
): Function | null => {
  const { enums, inventory } = generalConfig;
  const { name } = thingConfig;
  if (!checkInventory(['Mutation', 'createThing', name], inventory)) return null;

  const resolver = async (_: Object, args: Args, context: Context): Object => {
    const { data } = args;
    const { mongooseConn } = context;

    const { core, periphery, single, first } = processCreateInputData(data, thingConfig);

    const thingSchema = createThingSchema(thingConfig, enums);
    const Thing = mongooseConn.model(name, thingSchema);

    await updatePeriphery(periphery, mongooseConn);

    let thing;
    if (single) {
      const result = await Thing.create(first);
      thing = result.toObject();
    } else {
      const promises = [];
      core.forEach((bulkItems, config) => {
        const { name: name2 } = config;
        const thingSchema2 = createThingSchema(config, enums);
        const Thing2 = mongooseConn.model(name2, thingSchema2);
        promises.push(Thing2.bulkWrite(bulkItems));
      });
      await Promise.all(promises);
      // eslint-disable-next-line no-underscore-dangle
      thing = await Thing.findById(first._id, null, { lean: true });
    }

    const { _id } = thing;
    thing.id = _id;

    return thing;
  };

  return resolver;
};

module.exports = createCreateThingMutationResolver;
