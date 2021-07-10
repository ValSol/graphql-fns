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

  const {
    whereOne,
    whereOne: { id },
  } = args;

  const processingKind = 'push';
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

  let _id = id; // eslint-disable-line no-underscore-dangle
  const whereOne2 = id ? { _id } : whereOne;
  const { lookups, where: whereOne3 } = mergeWhereAndFilter(filter, whereOne, thingConfig);

  let conditions = whereOne3;

  if (lookups.length) {
    const arg = [...lookups];

    if (Object.keys(whereOne3).length) {
      arg.push({ $match: whereOne3 });
    }

    arg.push({ $project: { _id: 1 } });

    const [thing] = await Thing.aggregate(arg).exec();

    if (!thing) return null;

    conditions = { _id: thing._id }; // eslint-disable-line no-underscore-dangle
  }

  let previousThing = {};
  const subscriptionInventoryChain = ['Subscription', 'updatedThing', name];
  const allowSubscription = checkInventory(subscriptionInventoryChain, inventory);
  if (whereOne === whereOne2 || allowSubscription) {
    const projection = allowSubscription
      ? {} // if subsciption ON - return empty projection - to get all fields of thing
      : { _id: 1 };

    previousThing = await Thing.findOne(conditions, projection, { lean: true });
    if (!previousThing) return null;
    _id = previousThing._id; // eslint-disable-line no-underscore-dangle
  }

  const thing = await Thing.findOne(conditions, { _id: 1 }, { lean: true });

  return thing && [thing];
};

export default get;
