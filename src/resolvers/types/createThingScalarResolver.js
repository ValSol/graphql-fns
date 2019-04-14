// @flow

import type { ThingConfig } from '../../flowTypes';

const fs = require('fs');

const createThingSchema = require('../../mongooseModels/createThingSchema');
const getProjectionFromInfo = require('../getProjectionFromInfo');

type Args = { where: { id: string } };
type Context = { mongooseConn: Object };

const createThingScalarResolver = (thingConfig: ThingConfig): Function => {
  const resolver = async (parent: Object, args: Args, context: Context, info: Object): Object => {
    const { fieldName } = info;
    const id = parent[fieldName];

    if (!id) return null;

    const { mongooseConn } = context;

    const thingSchema = createThingSchema(thingConfig);
    const { name } = thingConfig;

    const Thing = await mongooseConn.model(name, thingSchema);
    const projection = getProjectionFromInfo(info);

    const thing = await Thing.findById(id, projection);
    const thing2 = thing.toObject();

    const fileName = 'scalar-thing.log';
    const delimiter = '***************************************\n';
    const result = `${delimiter}${fieldName}\n${delimiter}${id}\n${delimiter}${info}\n${delimiter}${JSON.stringify(
      info,
      null,
      ' ',
    )}\n${delimiter}`;
    fs.writeFileSync(fileName, result);

    const { _id } = thing2;
    thing2.id = _id;

    return thing2;
  };

  return resolver;
};

module.exports = createThingScalarResolver;
