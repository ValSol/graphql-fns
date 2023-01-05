// @flow

import type { GetPrevious } from '../../../flowTypes';

import checkInventory from '../../../../utils/inventory/checkInventory';
import createMongooseModel from '../../../../mongooseModels/createMongooseModel';
import mergeWhereAndFilter from '../../../utils/mergeWhereAndFilter';
import checkData from '../../checkData';

const get: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { entityConfig, generalConfig, serversideConfig } = resolverCreatorArg;
  const { args, context, parentFilters } = resolverArg;
  const { inventory, enums } = generalConfig;
  const { name } = entityConfig;

  const { mainEntity: filter } = parentFilters;

  if (!filter) return null;

  const {
    whereOne,
    whereOne: { id },
  } = args;

  const processingKind = 'push';
  const allowCreate = await checkData(
    args,
    filter,
    entityConfig,
    processingKind,
    generalConfig,
    serversideConfig,
    context,
  );

  if (!allowCreate) return null;

  const { mongooseConn } = context;

  const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

  let _id = id; // eslint-disable-line no-underscore-dangle
  const whereOne2 = id ? { _id } : whereOne;
  const { lookups, where: whereOne3 } = mergeWhereAndFilter(filter, whereOne, entityConfig);

  let conditions = whereOne3;

  if (lookups.length) {
    const arg = [...lookups];

    if (Object.keys(whereOne3).length) {
      arg.push({ $match: whereOne3 });
    }

    arg.push({ $project: { _id: 1 } });

    const [entity] = await Entity.aggregate(arg).exec();

    if (!entity) return null;

    conditions = { _id: entity._id }; // eslint-disable-line no-underscore-dangle
  }

  let previousEntity = {};
  const subscriptionInventoryChain = ['Subscription', 'updatedEntity', name];
  const allowSubscription = checkInventory(subscriptionInventoryChain, inventory);
  if (whereOne === whereOne2 || allowSubscription) {
    const projection = allowSubscription
      ? {} // if subsciption ON - return empty projection - to get all fields of entity
      : { _id: 1 };

    previousEntity = await Entity.findOne(conditions, projection, { lean: true });
    if (!previousEntity) return null;
    _id = previousEntity._id; // eslint-disable-line no-underscore-dangle
  }

  const entity = await Entity.findOne(conditions, { _id: 1 }, { lean: true });

  return entity && [entity];
};

export default get;
