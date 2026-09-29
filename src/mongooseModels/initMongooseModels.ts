import type { GeneralConfig } from '../tsTypes';

import createCounter, { CounterVariable } from './createCounter';
import createMongooseModel from './createMongooseModel';

type MongooseModels = Record<string, any>;

// models of all tangible entities (and of counters if any entity has "counter") with created
// collections and synced indexes; "force" syncs again models that are already synced
export const syncAllMongooseModels = async (
  mongooseConn: any,
  generalConfig: GeneralConfig,
  force = false,
): Promise<MongooseModels> => {
  const { allEntityConfigs, enums } = generalConfig;

  const result: MongooseModels = {};

  let withCounter = false;

  for (const entityConfig of Object.values(allEntityConfigs)) {
    if (entityConfig.type === 'tangible') {
      result[entityConfig.name] = await createMongooseModel(
        mongooseConn,
        entityConfig,
        enums,
        force,
      );

      if (entityConfig.counter) {
        withCounter = true;
      }
    }
  }

  if (withCounter) {
    result[CounterVariable] = await createCounter(mongooseConn, force);
  }

  return result;
};

// to call on the start of the application (and after a database is dropped): indexes are
// guaranteed to exist before the first write, errors of index building are thrown here
const initMongooseModels = (
  mongooseConn: any,
  generalConfig: GeneralConfig,
): Promise<MongooseModels> => syncAllMongooseModels(mongooseConn, generalConfig, true);

export default initMongooseModels;
