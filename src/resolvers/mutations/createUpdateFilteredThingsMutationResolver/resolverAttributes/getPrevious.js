// @flow

import type { GetPrevious } from '../../../flowTypes';

import executeAuthorisation from '../../../utils/executeAuthorisation';
import createThing from '../../../../mongooseModels/createThing';
import composeNearForAggregateInput from '../../../utils/composeNearForAggregateInput';
import mergeWhereAndFilter from '../../../utils/mergeWhereAndFilter';
import checkData from '../../checkData';

const get: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { thingConfig, generalConfig, serversideConfig, inAnyCase } = resolverCreatorArg;
  const { args, context, parentFilter } = resolverArg;
  const { enums } = generalConfig;
  const { name } = thingConfig;

  const inventoryChain = ['Mutation', actionGeneralName, name];

  const filter = inAnyCase
    ? parentFilter
    : // $FlowFixMe
      await executeAuthorisation(inventoryChain, context, serversideConfig);

  if (!filter) return null;

  const { data, near, where, search } = args;

  const toCreate = false;

  // eslint-disable-next-line no-await-in-loop
  const allowCreate = await checkData(
    data,
    filter,
    thingConfig,
    toCreate,
    generalConfig,
    serversideConfig,
    context,
  );

  if (!allowCreate) return [];

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

  const { lookups, where: preConditions } = mergeWhereAndFilter(filter, where, thingConfig);

  let conditions = preConditions;

  if (lookups.length || near || search) {
    const arg = [...lookups];

    if (near) {
      const geoNear = composeNearForAggregateInput(near);

      arg.unshift({ $geoNear: geoNear });
    }

    if (search) {
      arg.unshift({ $match: { $text: { $search: search } } });
    }

    if (Object.keys(conditions).length) {
      arg.push({ $match: conditions });
    }

    arg.push({ $project: { _id: 1 } });

    const things = await Thing.aggregate(arg).exec();

    if (!things) return null;

    if (!things.length) return [];

    conditions = { _id: { $in: things.map(({ _id }) => _id) } };
  }

  const previousThings = await Thing.find(conditions, duplexFieldsProjection, { lean: true });

  return previousThings;
};

export default get;
