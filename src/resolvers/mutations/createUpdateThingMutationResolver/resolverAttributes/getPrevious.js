// @flow

import type { GetPrevious } from '../../../flowTypes';

import checkInventory from '../../../../utils/checkInventory';
import executeAuthorisation from '../../../utils/executeAuthorisation';
import createThing from '../../../../mongooseModels/createThing';
import mergeWhereAndFilter from '../../../utils/mergeWhereAndFilter';
import checkData from '../../checkData';

const get: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { thingConfig, generalConfig, serversideConfig, inAnyCase } = resolverCreatorArg;
  const { args, context, parentFilter } = resolverArg;
  const { inventory, enums } = generalConfig;
  const { name } = thingConfig;

  const inventoryChain = ['Mutation', actionGeneralName, name];

  const filter = inAnyCase
    ? parentFilter
    : // $FlowFixMe
      await executeAuthorisation(inventoryChain, context, serversideConfig);

  if (!filter) return null;

  const { whereOne } = args;

  const processingKind = 'update';
  const allowCreate = await checkData(
    args,
    filter,
    thingConfig,
    processingKind,
    generalConfig,
    serversideConfig,
    context,
  );

  if (!allowCreate) return null;

  const { mongooseConn } = context;

  const Thing = await createThing(mongooseConn, thingConfig, enums);

  const { duplexFields } = thingConfig;
  const duplexFieldsProjection = duplexFields
    ? duplexFields.reduce(
        (prev, { name: name2 }) => {
          prev[name2] = 1; // eslint-disable-line no-param-reassign
          return prev;
        },
        { _id: 1 },
      )
    : {};

  const { lookups, where: whereOne2 } = mergeWhereAndFilter(filter, whereOne, thingConfig);

  let whereOne3 = whereOne2;

  if (lookups.length) {
    const arg = [...lookups];

    if (Object.keys(whereOne2).length) {
      arg.push({ $match: whereOne2 });
    }

    arg.push({ $project: { _id: 1 } });

    const [thing] = await Thing.aggregate(arg).exec();

    if (!thing) return null;

    whereOne3 = { _id: thing._id }; // eslint-disable-line no-underscore-dangle
  }

  const projection = checkInventory(['Subscription', 'updatedThing', name], inventory)
    ? {} // if subsciption ON - return empty projection - to get all fields of thing
    : duplexFieldsProjection;

  const previousThing = await Thing.findOne(whereOne3, projection, { lean: true });

  return previousThing && [previousThing];
};

export default get;
