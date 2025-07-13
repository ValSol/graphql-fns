import type { Context, GeneralConfig } from '../../../tsTypes';
import type { Core } from '../../tsTypes';

import createThingSchema from '../../../mongooseModels/createThingSchema';

const executeBulkItems = async (
  core: Core,
  generalConfig: GeneralConfig,
  context: Context,
  session: any,
): Promise<any[]> => {
  const { enums } = generalConfig;
  const { mongooseConn } = context;

  const result: any[] = [];

  for (const [config, bulkItems] of core.entries()) {
    const { name } = config;
    const thingSchema = createThingSchema(config, enums);
    const Entity =
      mongooseConn.models[`${name}_Thing`] || mongooseConn.model(`${name}_Thing`, thingSchema);

    result.push(await Entity.bulkWrite(bulkItems, { session, strict: true }));
  }

  return result;
};

export default executeBulkItems;
