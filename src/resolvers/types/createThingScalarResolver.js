// @flow

import type { Enums, ThingConfig } from '../../flowTypes';

import createThingSchema from '../../mongooseModels/createThingSchema';
import getProjectionFromInfo from '../getProjectionFromInfo';

type Args = { where: { id: string } };
type Context = { mongooseConn: Object };

const createThingScalarResolver = (thingConfig: ThingConfig, enums?: Enums = []): Function => {
  const resolver = async (parent: Object, args: Args, context: Context, info: Object): Object => {
    const { fieldName } = info;

    const id = parent[fieldName];

    if (!id) return null;

    const { mongooseConn } = context;

    const thingSchema = createThingSchema(thingConfig, enums);
    const { name } = thingConfig;

    const Thing = mongooseConn.model(name, thingSchema);
    const projection = getProjectionFromInfo(info);

    const thing = await Thing.findById(id, projection, { lean: true });

    if (!thing) return null; // if there's broken link

    const { _id } = thing;
    thing.id = _id;

    return thing;
  };

  return resolver;
};

export default createThingScalarResolver;
