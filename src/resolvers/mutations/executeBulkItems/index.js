// @flow
import type { GeneralConfig, ThingConfig } from '../../../flowTypes';

import createThingSchema from '../../../mongooseModels/createThingSchema';

type Context = { mongooseConn: Object, pubsub?: Object };

const executeBulkItems = async (
  core: Map<ThingConfig, Array<Object>>,
  generalConfig: GeneralConfig,
  context: Context,
  session: Object,
): Promise<Array<Object>> => {
  const { enums } = generalConfig;
  const { mongooseConn } = context;

  const promises = [];
  core.forEach((bulkItems, config) => {
    const { name } = config;
    const thingSchema = createThingSchema(config, enums);
    const Thing = mongooseConn.model(`${name}_Thing`, thingSchema);

    promises.push(Thing.bulkWrite(bulkItems, { session, strict: true }));
  });

  return Promise.all(promises);
};

export default executeBulkItems;
