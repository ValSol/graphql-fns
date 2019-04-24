// @flow
import type { ThingConfig } from '../../flowTypes';

const createThingSchema = require('../../mongooseModels/createThingSchema');
// const transformInputData = require('./transformInputData');
// const updatePeriphery = require('./updatePeriphery');

type Args = { where: { id: string } };
type Context = { mongooseConn: Object };

const createDeleteThingMutationResolver = (thingConfig: ThingConfig): Function => {
  const resolver = async (_: Object, args: Args, context: Context): Object => {
    const {
      where: { id },
    } = args;
    const { mongooseConn } = context;

    const { name } = thingConfig;
    const thingSchema = createThingSchema(thingConfig);
    const Thing = mongooseConn.model(name, thingSchema);

    const thing = await Thing.findById(id);
    const thing2 = thing.toObject();

    const { _id } = thing2;
    await Thing.deleteOne({ _id });

    thing2.id = _id;
    return thing2;
  };

  return resolver;
};

module.exports = createDeleteThingMutationResolver;
