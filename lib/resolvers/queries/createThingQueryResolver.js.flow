// @flow

import type { ThingConfig } from '../../flowTypes';

const fs = require('fs');

const createThingSchema = require('../../mongooseModels/createThingSchema');
const getProjectionFromInfo = require('../getProjectionFromInfo');

type Args = { where: { id: string } };
type Context = { mongooseConn: Object };

const createCreateThingMutationResolver = (thingConfig: ThingConfig): Function => {
  const resolver = async (_: Object, args: Args, context: Context, info: Object): Object => {
    const {
      where: { id },
    } = args;
    const { mongooseConn } = context;

    const fileName = 'thing.txt';
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
    const projection = getProjectionFromInfo(info);

    const thing = await Thing.findById({ _id: id }, projection);
    const thing2 = thing.toObject();
    const { _id } = thing2;
    thing2.id = _id;

    return thing2;
  };

  return resolver;
};

module.exports = createCreateThingMutationResolver;
