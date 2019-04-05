// @flow
const createThingSchema = require('../mongooseModels/createThingSchema');

type TextField = {
  name: string,
  default?: string | Array<string>,
  required?: boolean,
  array?: boolean,
};
type ThingConfig = { textFields?: Array<TextField>, thingName: string };

type Args = { input: Object };
type Context = { mongooseConn: Object };

const createAddThingMutationResolver = (thingConfig: ThingConfig): Function => {
  const resolver = async (_: Object, args: Args, context: Context): Object => {
    const { input } = args;
    const { mongooseConn } = context;

    const thingSchema = createThingSchema(thingConfig);
    const { thingName } = thingConfig;

    const Thing = await mongooseConn.model(thingName, thingSchema);

    const thing = await Thing.create(input);

    return thing;
  };

  return resolver;
};

module.exports = createAddThingMutationResolver;
