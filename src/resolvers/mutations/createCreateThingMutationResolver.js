// @flow
const fs = require('fs');

const createThingSchema = require('../../mongooseModels/createThingSchema');

type TextField = {
  name: string,
  default?: string | Array<string>,
  required?: boolean,
  array?: boolean,
};
type ThingConfig = { textFields?: Array<TextField>, thingName: string };

type Args = { data: Object };
type Context = { mongooseConn: Object };

const createCreateThingMutationResolver = (thingConfig: ThingConfig): Function => {
  const resolver = async (_: Object, args: Args, context: Context, info: Object): Object => {
    const { data } = args;
    const { mongooseConn } = context;

    const fileName = 'create-thing.txt';
    const delimiter = '***************************************\n';
    const result = `${delimiter}${info}\n${delimiter}${JSON.stringify(
      info,
      null,
      ' ',
    )}\n${delimiter}`;
    fs.writeFileSync(fileName, result);

    const thingSchema = createThingSchema(thingConfig);
    const { thingName } = thingConfig;

    const Thing = await mongooseConn.model(thingName, thingSchema);

    const thing = await Thing.create(data);
    const thing2 = thing.toObject();
    const { _id } = thing2;
    thing2.id = _id;

    return thing2;
  };

  return resolver;
};

module.exports = createCreateThingMutationResolver;
