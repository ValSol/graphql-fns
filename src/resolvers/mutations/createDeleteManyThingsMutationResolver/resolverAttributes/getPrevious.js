// @flow
import type { GetPrevious } from '../../../flowTypes';

import createThing from '../../../../mongooseModels/createThing';
import executeAuthorisation from '../../../utils/executeAuthorisation';
import mergeWhereAndFilter from '../../../utils/mergeWhereAndFilter';
import getProjectionFromInfo from '../../../utils/getProjectionFromInfo';

const get: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { thingConfig, generalConfig, serversideConfig, inAnyCase } = resolverCreatorArg;
  const { args, context, info, parentFilter } = resolverArg;
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

  whereOne.forEach((item) => {
    const whereOneKeys = Object.keys(item);
    if (whereOneKeys.length !== 1) {
      throw new TypeError('Expected exactly one key in where arg!');
    }
  });

  if (!whereOne.length) return [];

  const { lookups, where: preConditions } = mergeWhereAndFilter(
    filter,
    { OR: whereOne },
    thingConfig,
  );

  let conditions = preConditions;

  if (lookups.length) {
    const arg = [...lookups];

    if (Object.keys(preConditions).length) {
      arg.push({ $match: preConditions });
    }

    arg.push({ $project: { _id: 1 } });

    const things = await Thing.aggregate(arg).exec();

    if (things.length !== whereOne.length) return null;

    conditions = { _id: { $in: things.map(({ _id }) => _id) } };
  }

  const projection = getProjectionFromInfo(info);

  const things = await Thing.find(conditions, projection, { lean: true });
  if (things.length !== whereOne.length) return null;

  return things;
};

export default get;
