// @flow
import type { ThingConfig } from '../../flowTypes';

const fs = require('fs');

const createThingSchema = require('../../mongooseModels/createThingSchema');
const transformInputData = require('./transformInputData');

type Args = { data: Object };
type Context = { mongooseConn: Object };

const createCreateThingMutationResolver = (thingConfig: ThingConfig): Function => {
  const resolver = async (_: Object, args: Args, context: Context, info: Object): Object => {
    const { data } = args;
    const { mongooseConn } = context;

    const { name } = thingConfig;

    const thingSchema = createThingSchema(thingConfig);

    const data2 = transformInputData(data, thingConfig);

    const Thing = await mongooseConn.model(name, thingSchema);

    const thing = await Thing.create(data2);
    const thing2 = thing.toObject();

    const fileName = 'create-thing.log';
    const delimiter = '***************************************\n';
    const result = `${delimiter}${JSON.stringify(args, null, ' ')}\n${delimiter}${JSON.stringify(
      thing2,
      null,
      ' ',
    )}\n${delimiter}${info}\n${delimiter}${JSON.stringify(info, null, ' ')}\n${delimiter}`;
    fs.writeFileSync(fileName, result);

    const { _id } = thing2;
    thing2.id = _id;

    return thing2;
  };

  return resolver;
};

module.exports = createCreateThingMutationResolver;
