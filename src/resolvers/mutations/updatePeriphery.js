// @flow
import type { Periphery } from '../../flowTypes';

import createThingSchema from '../../mongooseModels/createThingSchema';

const updatePeriphery = async (periphery: Periphery, mongooseConn: Object): Promise<void> => {
  const promises = [];
  periphery.forEach((obj, config) => {
    const { name: configName } = config;
    const thingSchema = createThingSchema(config);
    const Thing = mongooseConn.model(configName, thingSchema);

    Object.keys(obj).forEach(oppositeName => {
      const { array, name, oppositeConfig, oppositeIds } = obj[oppositeName];
      const { name: configName2 } = oppositeConfig;
      const thingSchema2 = createThingSchema(oppositeConfig);
      const Thing2 = mongooseConn.model(configName2, thingSchema2);

      promises.push(
        Thing.find({ _id: { $in: oppositeIds } }, { [oppositeName]: 1 }).then(items => {
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

          return Thing2.bulkWrite(bulkItems);
        }),
      );
    });
  });

  await Promise.all(promises);
};

export default updatePeriphery;
