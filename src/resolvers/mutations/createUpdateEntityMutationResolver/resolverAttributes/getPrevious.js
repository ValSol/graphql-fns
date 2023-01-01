// @flow

import type { GetPrevious } from '../../../flowTypes';

import checkInventory from '../../../../utils/inventory/checkInventory';
import executeAuthorisation from '../../../utils/executeAuthorisation';
import createMongooseModel from '../../../../mongooseModels/createMongooseModel';
import mergeWhereAndFilter from '../../../utils/mergeWhereAndFilter';
import checkData from '../../checkData';

const get: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { entityConfig, generalConfig, serversideConfig, inAnyCase } = resolverCreatorArg;
  const { args, context, parentFilters } = resolverArg;
  const { inventory, enums } = generalConfig;
  const { name } = entityConfig;

  const inventoryChain = ['Mutation', actionGeneralName, name];

  const { foo: filter } = inAnyCase
    ? parentFilters
    : // $FlowFixMe
      await executeAuthorisation(inventoryChain, context, serversideConfig);

  if (!filter) return null;

  const { whereOne } = args;

  const processingKind = 'update';
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

  const { duplexFields } = entityConfig;
  const duplexFieldsProjection = duplexFields
    ? duplexFields.reduce(
        (prev, { name: name2 }) => {
          prev[name2] = 1; // eslint-disable-line no-param-reassign
          return prev;
        },
        { _id: 1 },
      )
    : {};

  const { lookups, where: whereOne2 } = mergeWhereAndFilter(filter, whereOne, entityConfig);

  let whereOne3 = whereOne2;

  if (lookups.length) {
    const arg = [...lookups];

    if (Object.keys(whereOne2).length) {
      arg.push({ $match: whereOne2 });
    }

    arg.push({ $project: { _id: 1 } });

    const [entity] = await Entity.aggregate(arg).exec();

    if (!entity) return null;

    whereOne3 = { _id: entity._id }; // eslint-disable-line no-underscore-dangle
  }

  const projection = checkInventory(['Subscription', 'updatedEntity', name], inventory)
    ? {} // if subsciption ON - return empty projection - to get all fields of entity
    : duplexFieldsProjection;

  const previousEntity = await Entity.findOne(whereOne3, projection, { lean: true });

  return previousEntity && [previousEntity];
};

export default get;
