// @flow
import type { Periphery } from '../../flowTypes';

import composeFieldsObject from '../../utils/composeFieldsObject';
import createThingSchema from '../../mongooseModels/createThingSchema';

const updatePeriphery = async (
  periphery: Periphery,
  mongooseConn: Object,
  session: Object = null,
): Promise<void> => {
  const promises = [];
  periphery.forEach((obj, config) => {
    const { name: configName } = config;
    const thingSchema = createThingSchema(config);
    const Thing = mongooseConn.model(`${configName}_Thing`, thingSchema);

    Object.keys(obj).forEach((oppositeName) => {
      const { array, name, oppositeConfig, oppositeIds } = obj[oppositeName];
      const { name: configName2 } = oppositeConfig;
      const thingSchema2 = createThingSchema(oppositeConfig);
      const Thing2 = mongooseConn.model(`${configName2}_Thing`, thingSchema2);

      promises.push(
        Thing.find(
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

          if (bulkItems.some((item) => item.updateOne.update.$unset)) {
            const fieldsObject = composeFieldsObject(oppositeConfig);

            if (fieldsObject[name].attributes.required) {
              throw new TypeError(
                `1 Try unset required field: "${name}" of thing: "${oppositeConfig.name}"!`,
              );
            }
          }

          return Thing2.bulkWrite(bulkItems, { session, strict: true });
        }),
      );
    });
  });

  await Promise.all(promises);
};

export default updatePeriphery;
