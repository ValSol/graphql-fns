import { Connection } from 'mongoose';

import type { DataObject, TangibleEntityConfig } from '../../../tsTypes';
import type { Core } from '../../tsTypes';

import createThingSchema from '../../../mongooseModels/createThingSchema';
import extractItemsToProcess from './extractItemsToProcess';

type Result = Map<TangibleEntityConfig, Array<DataObject>>;

const unwindCore = async (core: Core, mongooseConn: Connection): Promise<Result> => {
  const itemsToProcess = extractItemsToProcess(core);

  if (itemsToProcess.length === 0) {
    return core;
  }

  const mongooseModels = {};

  for (let i = itemsToProcess.length; i > 0; i -= 1) {
    const [bulkItems, index, config] = itemsToProcess[i - 1];

    if (mongooseModels[config.name] === undefined) {
      const thingSchema = createThingSchema(config);

      mongooseModels[config.name] =
        mongooseConn.models[`${config.name}_Thing`] ||
        mongooseConn.model(`${config.name}_Thing`, thingSchema);
    }

    const {
      updateMany: { filter, update },
    } = bulkItems[index];

    const entities = await mongooseModels[config.name].find(filter, { _id: 1 });

    if (entities.length === 0) {
      bulkItems.splice(index, 1); // remove "updateMany" item
    } else {
      const updateOnes = entities.map(({ _id }) => ({
        updateOne: { filter: { _id }, update },
      }));

      bulkItems.splice(index, 1, ...updateOnes); // replace "updateMany" item by "updateOne" items
    }
  }

  return core;
};

export default unwindCore;
