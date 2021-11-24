// @flow
import type { PrepareBulkData } from '../../../flowTypes';

import getOppositeFields from '../../../../utils/getOppositeFields';
import createThing from '../../../../mongooseModels/createThing';
import processDeleteData from '../../processDeleteData';

const getNotArrayOppositeDuplexFields = (thingConfig) =>
  getOppositeFields(thingConfig).filter(([{ parent }, { array }]) => parent && !array);

const processEveryField = async (
  fields,
  thing,
  core,
  usedIds,
  mongooseConn,
  enums,
  processChildrenField,
) => {
  for (let i = 0; i < fields.length; i += 1) {
    const [{ array, name, config }] = fields[i];

    if (array) {
      for (let j = 0; j < thing[name].length; j += 1) {
        const value = thing[name][j] && thing[name][j].toString();

        if (!value || (usedIds[config.name] && usedIds[config.name].includes(value))) {
          continue; // eslint-disable-line no-continue
        }

        if (!usedIds[config.name]) {
          usedIds[config.name] = []; // eslint-disable-line no-param-reassign
        }

        usedIds[config.name].push(value);

        await processChildrenField(value, core, config, usedIds, mongooseConn, enums); // eslint-disable-line no-await-in-loop
      }
    } else {
      const value = thing[name] && thing[name].toString();

      if (!value || (usedIds[config.name] && usedIds[config.name].includes(value))) {
        continue; // eslint-disable-line no-continue
      }

      if (!usedIds[config.name]) {
        usedIds[config.name] = []; // eslint-disable-line no-param-reassign
      }

      usedIds[config.name].push(value);

      await processChildrenField(value, core, config, usedIds, mongooseConn, enums); // eslint-disable-line no-await-in-loop
    }
  }
};

const processChildrenField = async (id, core, thingConfig, usedIds, mongooseConn, enums) => {
  const Thing = await createThing(mongooseConn, thingConfig, enums);

  const projection = (thingConfig.duplexFields || []).reduce(
    (prev, { name }) => {
      prev[name] = 1; // eslint-disable-line no-param-reassign
      return prev;
    },
    { _id: 1 },
  );

  const thing = await Thing.findOne({ _id: id }, projection, { lean: true });

  processDeleteData(thing, core, thingConfig, true);

  const notArrayOppositeDuplexFields = getNotArrayOppositeDuplexFields(thingConfig);

  if (!notArrayOppositeDuplexFields.length) {
    return core;
  }

  await processEveryField(
    notArrayOppositeDuplexFields,
    thing,
    core,
    usedIds,
    mongooseConn,
    enums,
    processChildrenField,
  );

  return core;
};

const prepareBulkData: PrepareBulkData = async (
  resolverCreatorArg,
  resolverArg,
  prevPreparedData,
) => {
  const {
    args: { options },
    context: { mongooseConn },
  } = resolverArg;
  const {
    thingConfig,
    generalConfig: { enums },
  } = resolverCreatorArg;

  const toDelete = true;
  let { core } = prevPreparedData;
  const { mains } = prevPreparedData;

  mains.forEach((thing) => {
    core = processDeleteData(thing, core, thingConfig, toDelete);
  });

  const notArrayOppositeDuplexFields = getNotArrayOppositeDuplexFields(thingConfig);

  const fieldsToDelete = options
    ? notArrayOppositeDuplexFields.filter(([{ name }]) => options.fieldsToDelete.includes(name))
    : notArrayOppositeDuplexFields;

  const usedIds = { [thingConfig.name]: [] }; // eslint-disable-line no-underscore-dangle

  for (let i = 0; i < mains.length; i += 1) {
    const thing = mains[i];
    core = processDeleteData(thing, core, thingConfig, toDelete);

    usedIds[thingConfig.name].push(thing._id.toString()); // eslint-disable-line no-underscore-dangle

    // eslint-disable-next-line no-await-in-loop
    await processEveryField(
      fieldsToDelete,
      thing,
      core,
      usedIds,
      mongooseConn,
      enums,
      processChildrenField,
    );
  }

  return { ...prevPreparedData, core };
};

export default prepareBulkData;
