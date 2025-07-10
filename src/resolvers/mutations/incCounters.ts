import { Connection } from 'mongoose';

import type { DataObject, TangibleEntityConfig } from '../../tsTypes';
import type { Core } from '../tsTypes';

import createCounter from '../../mongooseModels/createCounter';

const incCounters = async (
  core: Core,
  mongooseConn: Connection,
  session?: any,
): Promise<Map<TangibleEntityConfig, Array<DataObject>>> => {
  const itemsToInc: Record<string, any> = {};
  core.forEach((bulkItems, config) => {
    if (config.type !== 'tangible') return;

    const { name, counter } = config;
    if (counter) {
      const items = bulkItems.filter(({ insertOne }) => insertOne);
      if (items.length) {
        itemsToInc[name] = items.length;
      }
    }
  });

  const names = Object.keys(itemsToInc);
  if (!names.length) {
    return core;
  }

  const Counter = createCounter(mongooseConn);

  const nameToCounter: Record<string, any> = {};

  for (let i = 0; i < names.length; i += 1) {
    const name = names[i];

    const { seq } = await Counter.findOneAndUpdate(
      { _id: name },
      { $inc: { seq: itemsToInc[name] } },
      {
        new: true,
        upsert: true,
        lean: true,
        session,
      },
    );

    nameToCounter[name] = seq - itemsToInc[name] + 1;
  }

  core.forEach((bulkItems, config, map) => {
    const { name } = config;
    if (nameToCounter[name]) {
      let i = 0;
      map.set(
        config,
        bulkItems.map((item) => {
          const { insertOne } = item;
          if (!insertOne) return item;

          const result = {
            insertOne: {
              document: {
                ...insertOne.document,
                counter: nameToCounter[name] + i,
              },
            },
          } as const;
          i += 1;
          return result;
        }),
      );
    }
  });

  return core;
};

export default incCounters;
