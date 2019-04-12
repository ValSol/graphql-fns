// @flow
import type { ThingConfig } from '../../flowTypes';

const fs = require('fs');

const createThingSchema = require('../../mongooseModels/createThingSchema');

type Args = { data: Object };
type Context = { mongooseConn: Object };

const createCreateThingMutationResolver = (thingConfig: ThingConfig): Function => {
  const resolver = async (_: Object, args: Args, context: Context, info: Object): Object => {
    const { data } = args;
    const { mongooseConn } = context;

    const thingSchema = createThingSchema(thingConfig);
    const { relationalFields, thingName } = thingConfig;

    let relationalFieldsNames = [];
    if (relationalFields) {
      relationalFieldsNames = relationalFields.map(({ name }) => name);
    }

    const data2 = Object.keys(data).reduce((prev, key) => {
      if (relationalFieldsNames.includes(key)) {
        // eslint-disable-next-line no-param-reassign
        prev[key] = data[key].connect;
      } else {
        // eslint-disable-next-line no-param-reassign
        prev[key] = data[key];
      }
      return prev;
    }, {});

    const Thing = await mongooseConn.model(thingName, thingSchema);

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
