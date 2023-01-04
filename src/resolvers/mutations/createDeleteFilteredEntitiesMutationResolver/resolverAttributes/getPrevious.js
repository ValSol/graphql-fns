// @flow
import type { GetPrevious } from '../../../flowTypes';

import createMongooseModel from '../../../../mongooseModels/createMongooseModel';
import composeNearForAggregateInput from '../../../utils/composeNearForAggregateInput';
import mergeWhereAndFilter from '../../../utils/mergeWhereAndFilter';
import getProjectionFromInfo from '../../../utils/getProjectionFromInfo';

const get: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { entityConfig, generalConfig } = resolverCreatorArg;
  const { args, context, info, parentFilters } = resolverArg;
  const { enums } = generalConfig;

  const { foo: filter } = parentFilters;

  if (!filter) return null;

  const { near, where, search } = args;

  const { mongooseConn } = context;

  const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

  const { lookups, where: preConditions } = mergeWhereAndFilter(filter, where, entityConfig) || {};

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

  const projection = getProjectionFromInfo(info);

  (entityConfig.duplexFields || []).reduce((prev, { name: name2 }) => {
    prev[name2] = 1; // eslint-disable-line no-param-reassign
    return prev;
  }, projection);

  const entities = await Entity.find(conditions, projection, { lean: true });

  return entities;
};

export default get;
