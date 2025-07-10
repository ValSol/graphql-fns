import type { Context, GeneralConfig } from '../../../tsTypes';
import type { Core } from '../../tsTypes';

import createThingSchema from '../../../mongooseModels/createThingSchema';

const executeBulkItems = (
  core: Core,
  generalConfig: GeneralConfig,
  context: Context,
  session: any,
): Promise<any[]> => {
  const { enums } = generalConfig;
  const { mongooseConn } = context;

  const promises: Promise<any>[] = [];
  core.forEach((bulkItems, config) => {
    const { name } = config;
    const thingSchema = createThingSchema(config, enums);
    const Entity =
      mongooseConn.models[`${name}_Thing`] || mongooseConn.model(`${name}_Thing`, thingSchema);

    // @ts-ignore
    promises.push(Entity.bulkWrite(bulkItems, { session, strict: true }));
  });

  return Promise.all(promises);
};

export default executeBulkItems;
