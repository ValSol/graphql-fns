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

    const inputDataArray = transformInputData(data, thingConfig);

    const { name } = thingConfig;
    const thingSchema = createThingSchema(thingConfig);
    const Thing = mongooseConn.model(name, thingSchema);

    let thing;
    if (inputDataArray.length === 1) {
      const result = await Thing.create(inputDataArray[0].data);
      thing = result.toObject();
    } else {
      const assortment = new Map();
      inputDataArray.reduce((prev, { config, data: document }) => {
        const bulkItem = {
          insertOne: {
            document,
          },
        };
        if (assortment.get(config)) {
          // $FlowFixMe
          assortment.get(config).push(bulkItem);
        } else {
          assortment.set(config, [bulkItem]);
        }
        return prev;
      }, assortment);

      const promises = [];
      assortment.forEach((bulkItems, config) => {
        const { name: name2 } = config;
        const thingSchema2 = createThingSchema(config);
        const Thing2 = mongooseConn.model(name2, thingSchema2);
        promises.push(Thing2.bulkWrite(bulkItems));
      });
      await Promise.all(promises);
      // eslint-disable-next-line no-underscore-dangle
      const result = await Thing.findById(inputDataArray[0].data._id);
      thing = result.toObject();
    }

    const fileName = 'create-thing.log';
    const delimiter = '***************************************\n';
    const result = `${delimiter}${JSON.stringify(args, null, ' ')}\n${delimiter}${JSON.stringify(
      thing,
      null,
      ' ',
    )}\n${delimiter}${info}\n${delimiter}${JSON.stringify(info, null, ' ')}\n${delimiter}`;
    fs.writeFileSync(fileName, result);

    const { _id } = thing;
    thing.id = _id;

    return thing;
  };

  return resolver;
};

module.exports = createCreateThingMutationResolver;
