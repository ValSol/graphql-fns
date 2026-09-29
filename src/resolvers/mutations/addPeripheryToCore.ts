import { Connection } from 'mongoose';

import type { DataObject, Periphery, TangibleEntityConfig } from '../../tsTypes';
import type { Core } from '../tsTypes';

import createMongooseModel from '../../mongooseModels/createMongooseModel';

type Result = Map<TangibleEntityConfig, Array<DataObject>>;

const addPeripheryToCore = async (
  periphery: Periphery,
  core: Core,
  mongooseConn: Connection,
  session?: any,
): Promise<Result> => {
  const tasks: Array<() => Promise<void | DataObject>> = [];

  for (const [config, obj] of periphery.entries()) {
    const Entity = await createMongooseModel(mongooseConn, config);

    for (const oppositeName of Object.keys(obj)) {
      const { array, name, oppositeConfig, oppositeIds } = obj[oppositeName];

      tasks.push(() =>
        Entity.find(
          { _id: { $in: oppositeIds }, [oppositeName]: { $exists: true, $ne: null } },
          { [oppositeName]: 1 },
          { session },
        ).then((items) => {
          const bulkItems = items
            .map((item, i) =>
              item
                ? {
                    updateOne: {
                      filter: {
                        _id: item[oppositeName],
                      },
                      update: array
                        ? {
                            $pull: {
                              [name]: oppositeIds[i],
                            },
                          }
                        : {
                            $unset: { [name]: 1 },
                          },
                    },
                  }
                : null,
            )
            .filter(Boolean);

          const resultItem = core.get(oppositeConfig);

          if (resultItem) {
            bulkItems.reverse();
            resultItem.unshift(...bulkItems);
          } else {
            core.set(oppositeConfig, bulkItems);
          }
        }),
      );
    }
  }

  for (const task of tasks) {
    await task();
  }

  return core;
};

export default addPeripheryToCore;
