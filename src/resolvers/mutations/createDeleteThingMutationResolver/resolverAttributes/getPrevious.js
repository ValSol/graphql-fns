// @flow
import type { GetPrevious } from '../../../flowTypes';

import createThing from '../../../../mongooseModels/createThing';
import executeAuthorisation from '../../../utils/executeAuthorisation';
import mergeWhereAndFilter from '../../../utils/mergeWhereAndFilter';

const getPrevious: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { thingConfig, generalConfig, serversideConfig, inAnyCase } = resolverCreatorArg;
  const { args, context, parentFilter } = resolverArg;
  const { enums } = generalConfig;
  const { name } = thingConfig;

  const inventoryChain = ['Mutation', actionGeneralName, name];
  if (!inAnyCase && !(await executeAuthorisation(inventoryChain, context, serversideConfig))) {
    return null;
  }

  const filter = inAnyCase
    ? parentFilter
    : // $FlowFixMe
      await executeAuthorisation(inventoryChain, context, serversideConfig);

  if (!filter) return null;

  const { whereOne } = args;

  const { mongooseConn } = context;

  const Thing = await createThing(mongooseConn, thingConfig, enums);

  const whereOneKeys = Object.keys(whereOne);
  if (whereOneKeys.length !== 1) {
    throw new TypeError('Expected exactly one key in where arg!');
  }

  const { lookups, where: preConditions } = mergeWhereAndFilter(filter, whereOne, thingConfig);

  let conditions = preConditions;

  if (lookups.length) {
    const arg = [...lookups];

    if (Object.keys(preConditions).length) {
      arg.push({ $match: preConditions });
    }

    arg.push({ $project: { _id: 1 } });

    const [thing] = await Thing.aggregate(arg).exec();

    if (!thing) return null;

    conditions = { _id: thing._id }; // eslint-disable-line no-underscore-dangle
  }

  const thing = await Thing.findOne(conditions, null, { lean: true });
  if (!thing) return null;

  return [thing];
};

export default getPrevious;
