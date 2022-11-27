// @flow

import type { GetPrevious } from '../../../flowTypes';

import executeAuthorisation from '../../../utils/executeAuthorisation';
import createEntity from '../../../../mongooseModels/createThing';
import composeNearForAggregateInput from '../../../utils/composeNearForAggregateInput';
import mergeWhereAndFilter from '../../../utils/mergeWhereAndFilter';
import checkData from '../../checkData';

const get: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { entityConfig, generalConfig, serversideConfig, inAnyCase } = resolverCreatorArg;
  const { args, context, parentFilter } = resolverArg;
  const { enums } = generalConfig;
  const { name } = entityConfig;

  const inventoryChain = ['Mutation', actionGeneralName, name];

  const filter = inAnyCase
    ? parentFilter
    : // $FlowFixMe
      await executeAuthorisation(inventoryChain, context, serversideConfig);

  if (!filter) return null;

  const { data, near, where, search } = args;

  const { mongooseConn } = context;

  const Entity = await createEntity(mongooseConn, entityConfig, enums);

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

  const { lookups, where: preConditions } = mergeWhereAndFilter(filter, where, entityConfig);

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

    const entities = await Entity.aggregate(arg).exec();

    if (!entities) return null;

    if (!entities.length) return [];

    conditions = { _id: { $in: entities.map(({ _id }) => _id) } };
  }

  const previousEntities = await Entity.find(conditions, duplexFieldsProjection, { lean: true });

  const previousEntities2 = [];
  const processingKind = 'update';
  for (let i = 0; i < previousEntities.length; i += 1) {
    const previousEntity = previousEntities[i];
    const { _id: id } = previousEntity;

    // eslint-disable-next-line no-await-in-loop
    const allowCreate = await checkData(
      { data, whereOne: { id } },
      filter,
      entityConfig,
      processingKind,
      generalConfig,
      serversideConfig,
      context,
    );

    if (allowCreate) previousEntities2.push(previousEntity);
  }

  return previousEntities2;
};

export default get;
