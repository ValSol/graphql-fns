// @flow
import type { GeneralConfig, EntityConfig } from '../../../flowTypes';

import createThingSchema from '../../../mongooseModels/createThingSchema';

type Context = { mongooseConn: Object, pubsub?: Object };

const executeBulkItems = async (
  core: Map<EntityConfig, Array<Object>>,
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
    const Entity = mongooseConn.model(`${name}_Thing`, thingSchema);

    promises.push(Entity.bulkWrite(bulkItems, { session, strict: true }));
  });

  return Promise.all(promises);
};

export default executeBulkItems;
