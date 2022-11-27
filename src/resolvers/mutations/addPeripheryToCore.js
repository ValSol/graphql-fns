// @flow
import type { Periphery, EntityConfig } from '../../flowTypes';

import createThingSchema from '../../mongooseModels/createThingSchema';

type Result = Map<EntityConfig, Array<Object>>;

const updatePeriphery = async (
  periphery: Periphery,
  core: Map<EntityConfig, Array<Object>>,
  mongooseConn: Object,
): Promise<Result> => {
  const promises = [];
  periphery.forEach((obj, config) => {
    const { name: configName } = config;
    const thingSchema = createThingSchema(config);
    const Entity = mongooseConn.model(`${configName}_Thing`, thingSchema);

    Object.keys(obj).forEach((oppositeName) => {
      const { array, name, oppositeConfig, oppositeIds } = obj[oppositeName];

      promises.push(
        Entity.find(
          {
            _id: { $in: oppositeIds },
            [oppositeName]: { $exists: true, $ne: null },
          },
          {
            [oppositeName]: 1,
          },
        ).then((items) => {
          const bulkItems = items
            .map((item, i) =>
              item
                ? {
                    updateOne: {
                      filter: {
                        // eslint-disable-next-line no-underscore-dangle
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
    });
  });

  await Promise.all(promises);

  return core;
};

export default updatePeriphery;
