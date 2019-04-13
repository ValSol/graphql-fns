// @flow

import type { ThingConfig } from '../../flowTypes';

const fs = require('fs');

const createThingSchema = require('../../mongooseModels/createThingSchema');
// const getProjectionFromInfo = require('../getProjectionFromInfo');

type Args = { where: { id: string } };
type Context = { mongooseConn: Object };

const createThingScalarResolver = (thingConfig: ThingConfig): Function => {
  const resolver = async (parent: Object, args: Args, context: Context, info: Object): Object => {
    const { fieldName } = info;
    const ids = parent[fieldName];

    if (!ids.length) return [];

    const { mongooseConn } = context;

    const thingSchema = createThingSchema(thingConfig);
    const { thingName } = thingConfig;

    const Thing = await mongooseConn.model(thingName, thingSchema);
    // const projection = getProjectionFromInfo(info);

    // const thing = await Thing.findById({ _id: id }, projection);
    const things = await Thing.find({ _id: { $in: ids } });

    const things2 = things.map(item => {
      const result = item.toObject();
      // eslint-disable-next-line no-underscore-dangle
      result.id = result._id;
      return result;
    });

    const fileName = 'array-thing.log';
    const delimiter = '***************************************\n';
    const result = `${delimiter}${fieldName}\n${delimiter}${ids}\n${delimiter}${info}\n${delimiter}${JSON.stringify(
      info,
      null,
      ' ',
    )}\n${delimiter}`;
    fs.writeFileSync(fileName, result);

    return things2;
  };

  return resolver;
};

module.exports = createThingScalarResolver;
