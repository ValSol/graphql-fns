// @flow
import type { PrepareBulkData } from '../../../flowTypes';

import processDeleteData from '../../processDeleteData';

import {
  getNotArrayOppositeDuplexFields,
  processEveryField,
  processChildrenField,
} from '../../processFieldToDelete';

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
