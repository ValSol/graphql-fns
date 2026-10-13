import type { Enums, EntityConfig } from '../tsTypes';

import createEntitySchema from './createEntitySchema';
import syncModelIndexes from './syncModelIndexes';

// the only way to get a model of an entity: the model is registered on the passed connection and
// its collection and indexes are synced before the first use (see "docs/mongoose-models.md")
const createMongooseModel = async (
  mongooseConn: any,
  entityConfig: EntityConfig,
  enums: Enums = {},
  force = false,
): Promise<any> => {
  const { name, type: configType } = entityConfig;

  if (configType === 'tangible') {
    const entitySchema = createEntitySchema(entityConfig, enums);

    const EntityModel =
      mongooseConn.models[`${name}_Thing`] || mongooseConn.model(`${name}_Thing`, entitySchema);

    await syncModelIndexes(mongooseConn, EntityModel, `"${name}" entity`, force);

    return EntityModel;
  }

  throw new TypeError(`Incorrect type: "${configType}" in config with name: "${name}"!`);
};

export default createMongooseModel;
