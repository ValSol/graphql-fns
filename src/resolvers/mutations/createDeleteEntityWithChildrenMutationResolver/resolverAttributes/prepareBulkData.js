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
    entityConfig,
    generalConfig: { enums },
  } = resolverCreatorArg;

  const toDelete = true;
  let { core } = prevPreparedData;
  const { mains } = prevPreparedData;

  mains.forEach((entity) => {
    core = processDeleteData(entity, core, entityConfig, toDelete);
  });

  const notArrayOppositeDuplexFields = getNotArrayOppositeDuplexFields(entityConfig);

  const fieldsToDelete = options
    ? notArrayOppositeDuplexFields.filter(([{ name }]) => options.fieldsToDelete.includes(name))
    : notArrayOppositeDuplexFields;

  const usedIds = { [entityConfig.name]: [] }; // eslint-disable-line no-underscore-dangle

  for (let i = 0; i < mains.length; i += 1) {
    const entity = mains[i];
    core = processDeleteData(entity, core, entityConfig, toDelete);

    usedIds[entityConfig.name].push(entity._id.toString()); // eslint-disable-line no-underscore-dangle

    // eslint-disable-next-line no-await-in-loop
    await processEveryField(
      fieldsToDelete,
      entity,
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
