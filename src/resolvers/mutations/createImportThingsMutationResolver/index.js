// @flow
import getStream from 'get-stream';
import csvParse from 'csv-parse/lib/sync';

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';

import checkInventory from '../../../utils/checkInventory';
import coerceDataToGql from '../../../utils/coerceDataToGql';
import createThingSchema from '../../../mongooseModels/createThingSchema';
import executeAuthorisation from '../../executeAuthorisation';
import addIdsToThing from '../../addIdsToThing';
import processCreateInputData from '../processCreateInputData';
import updatePeriphery from '../updatePeriphery';
import allocateFieldsForCSV from './allocateFieldsForCSV';

const csvParse2 = (data, fieldsForCSV) =>
  csvParse(data, {
    columns: true,
    cast(value, context) {
      if (fieldsForCSV.object.includes(context.column)) {
        return value && JSON.parse(value);
      }
      if (fieldsForCSV.int.includes(context.column)) {
        return value && Number.parseInt(value, 10);
      }
      if (fieldsForCSV.float.includes(context.column)) {
        return value && Number.parseFloat(value);
      }
      if (fieldsForCSV.boolean.includes(context.column)) {
        return !!value && !!Number.parseInt(value, 10);
      }
      return value;
    },
  });

type Args = { file: Object, options?: { format: 'csv' | 'json' } }; // todo set DOM file type
type Context = { mongooseConn: Object, pubsub?: Object };

const createImportThingsMutationResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Function | null => {
  const { enums, inventory } = generalConfig;
  const { name } = thingConfig;
  const inventoryChain = ['Mutation', 'createThing', name];
  const inventoryChain2 = ['Mutation', 'importThings', name];
  if (!checkInventory(inventoryChain, inventory) || !checkInventory(inventoryChain2, inventory))
    return null;

  const resolver = async (parent: Object, args: Args, context: Context, info: Object): Object => {
    const resolverArgs = { parent, args, context, info };
    const credentials = await executeAuthorisation({
      inventoryChain,
      resolverArgs,
      serversideConfig,
    });
    await executeAuthorisation({
      inventoryChain: inventoryChain2,
      resolverArgs,
      serversideConfig,
      credentials,
    });

    const { file, options } = args;
    // const { filename, mimetype, encoding, createReadStream } = await file;
    const { createReadStream } = await file;
    const content = await getStream(createReadStream());

    let originalData;
    if (options && options.format === 'csv') {
      const fieldsForCSV = allocateFieldsForCSV(thingConfig);
      originalData = await csvParse2(content, fieldsForCSV);
    } else {
      originalData = JSON.parse(content);
    }

    const skipUnusedFields = true;
    const data = originalData.map((item) =>
      coerceDataToGql(item, null, thingConfig, skipUnusedFields),
    );

    // code beneath is identical to code from createCreateManyThingsMutationResolver

    const { mongooseConn } = context;

    let overallCore = null;
    let overallPeriphery = null;
    const ids = [];

    data.forEach((dataItem) => {
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
        const Thing2 = mongooseConn.model(`${name2}_Thing`, thingSchema2);
        promises.push(Thing2.bulkWrite(bulkItems));
      });

      await Promise.all(promises);
    }

    const thingSchema = createThingSchema(thingConfig, enums);
    const Thing = mongooseConn.model(`${name}_Thing`, thingSchema);

    const things = await Thing.find({ _id: { $in: ids } }, null, { lean: true });

    const things2 = things.map((item) => addIdsToThing(item, thingConfig));

    return things2;
  };

  return resolver;
};

export default createImportThingsMutationResolver;