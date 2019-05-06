// @flow
import type { GeneralConfig, ThingConfig } from '../../flowTypes';

const createThingSchema = require('../../mongooseModels/createThingSchema');
const processUpdateDuplexInputData = require('./processUpdateDuplexInputData');
const processUpdateInputData = require('./processUpdateInputData');
const processDeleteData = require('./processDeleteData');
const updatePeriphery = require('./updatePeriphery');

type Args = { data: Object, where: Object };
type Context = { mongooseConn: Object };

const createUpdateThingMutationResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
): Function => {
  const { enums } = generalConfig;

  const resolver = async (_: Object, args: Args, context: Context): Object => {
    const { mongooseConn } = context;
    const {
      where,
      where: { id },
      data,
    } = args;

    const { name: thingName, duplexFields } = thingConfig;
    const thingSchema = createThingSchema(thingConfig, enums);
    const Thing = mongooseConn.model(thingName, thingSchema);

    const duplexFieldsProjection = duplexFields
      ? duplexFields.reduce((prev, { name }) => {
          if (data[name]) prev[name] = 1; // eslint-disable-line no-param-reassign
          return prev;
        }, {})
      : {};

    const mainData = processUpdateInputData(data, thingConfig);

    let thing;
    let _id = id; // eslint-disable-line no-underscore-dangle
    if (Object.keys(duplexFieldsProjection).length) {
      const where2 = id ? { _id } : where;
      const currentData = await Thing.findOne(where2, duplexFieldsProjection, { lean: true });

      const data2 = { ...data, _id };
      const bulkItemsMap = processDeleteData(currentData, thingConfig);

      const { core, periphery } = processUpdateDuplexInputData(data2, thingConfig, bulkItemsMap);

      await updatePeriphery(periphery, mongooseConn);

      const promises = [];
      core.forEach((bulkItems, config) => {
        const { name: name2 } = config;
        const thingSchema2 = createThingSchema(config, enums);
        const Thing2 = mongooseConn.model(name2, thingSchema2);
        promises.push(Thing2.bulkWrite(bulkItems));
      });
      await Promise.all(promises);

      thing = await Thing.findOneAndUpdate({ _id }, mainData, {
        new: true,
        lean: true,
      });
    } else if (id) {
      _id = id;
      thing = await Thing.findOneAndUpdate({ _id }, mainData, { new: true, lean: true });
    } else {
      thing = await Thing.findOneAndUpdate(where, mainData, { new: true, lean: true });
      if (!thing) return null;
      _id = thing._id; // eslint-disable-line no-underscore-dangle, prefer-destructuring
    }

    thing.id = _id;

    return thing;
  };

  return resolver;
};

module.exports = createUpdateThingMutationResolver;
