// @flow
import getStream from 'get-stream';

import type { GeneralConfig, ThingConfig } from '../../flowTypes';

import checkInventory from '../../utils/checkInventory';
import createThingSchema from '../../mongooseModels/createThingSchema';
import processCreateInputData from './processCreateInputData';
import updatePeriphery from './updatePeriphery';

type Args = { file: Object }; // todo set DOM file type
type Context = { mongooseConn: Object, pubsub?: Object };

const createImportThingsMutationResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
): Function | null => {
  const { enums, inventory } = generalConfig;
  const { name } = thingConfig;
  if (
    !checkInventory(['Mutation', 'createThing', name], inventory) ||
    !checkInventory(['Mutation', 'importThings', name], inventory)
  )
    return null;

  const resolver = async (_: Object, args: Args, context: Context): Object => {
    const { file } = args;
    // const { filename, mimetype, encoding, createReadStream } = await file;
    const { createReadStream } = await file;
    const content = await getStream(createReadStream());
    const data = JSON.parse(content);
    const { mongooseConn } = context;

    let overallCore = null;
    let overallPeriphery = null;
    const ids = [];

    data.forEach(dataItem => {
      const { core, periphery, first } = processCreateInputData(
        dataItem,
        overallCore,
        overallPeriphery,
        thingConfig,
      );
      // eslint-disable-next-line no-underscore-dangle
      ids.push(first._id);
      overallCore = core;
      overallPeriphery = periphery;
    });

    // if check to eliminate flowjs error
    if (overallPeriphery && overallCore) {
      await updatePeriphery(overallPeriphery, mongooseConn);

      const promises = [];
      overallCore.forEach((bulkItems, config) => {
        const { name: name2 } = config;
        const thingSchema2 = createThingSchema(config, enums);
        const Thing2 = mongooseConn.model(name2, thingSchema2);
        promises.push(Thing2.bulkWrite(bulkItems));
      });

      await Promise.all(promises);
    }

    const thingSchema = createThingSchema(thingConfig, enums);
    const Thing = mongooseConn.model(name, thingSchema);

    const things = await Thing.find({ _id: { $in: ids } }, null, { lean: true });

    const things2 = things.map(item => {
      const { _id: id, ...rest } = item;
      return { ...rest, id };
    });

    return things2;
  };

  return resolver;
};

export default createImportThingsMutationResolver;
