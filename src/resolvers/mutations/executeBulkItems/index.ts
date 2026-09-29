import type { Context, GeneralConfig } from '../../../tsTypes';
import type { Core } from '../../tsTypes';

import createMongooseModel from '../../../mongooseModels/createMongooseModel';

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
    const Entity = await createMongooseModel(mongooseConn, config, enums);

    result.push(await Entity.bulkWrite(bulkItems, { session, strict: true }));
  }

  return result;
};

export default executeBulkItems;
