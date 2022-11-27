// @flow
import type { EntityConfig } from '../../flowTypes';

import createCounter from '../../mongooseModels/createCounter';

const incCounters = async (
  core: Map<EntityConfig, Array<Object>>,
  mongooseConn: Object,
): Promise<Map<EntityConfig, Array<Object>>> => {
  const itemsToInc = {};
  core.forEach((bulkItems, config) => {
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

  const nameToCounter = {};

  for (let i = 0; i < names.length; i += 1) {
    const name = names[i];
    // eslint-disable-next-line no-await-in-loop
    const { seq } = await Counter.findOneAndUpdate(
      { _id: name },
      { $inc: { seq: itemsToInc[name] } },
      {
        new: true,
        upsert: true,
        lean: true,
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
          };
          i += 1;
          return result;
        }),
      );
    }
  });

  return core;
};

export default incCounters;
