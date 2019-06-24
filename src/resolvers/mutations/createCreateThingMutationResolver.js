// @flow
import type { GeneralConfig, ThingConfig } from '../../flowTypes';

import checkInventory from '../../utils/checkInventory';
import createThingSchema from '../../mongooseModels/createThingSchema';
import processCreateInputData from './processCreateInputData';
import updatePeriphery from './updatePeriphery';

type Args = { data: Object };
type Context = { mongooseConn: Object, pubsub?: Object };

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

    const { core, periphery, single, first } = processCreateInputData(
      data,
      null,
      null,
      thingConfig,
    );

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

    if (checkInventory(['Subscription', 'createdThing', name], inventory)) {
      const { pubsub } = context;
      if (!pubsub) throw new TypeError('Context have to have pubsub for subscription!'); // to prevent flowjs error
      pubsub.publish(`created-${name}`, { [`created${name}`]: thing });
    }

    return thing;
  };

  return resolver;
};

export default createCreateThingMutationResolver;
