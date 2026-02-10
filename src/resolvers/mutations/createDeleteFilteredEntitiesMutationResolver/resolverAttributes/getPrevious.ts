import type { NearInput, TangibleEntityConfig } from '@/tsTypes';
import type { GetPrevious } from '@/resolvers/tsTypes';

import createMongooseModel from '@/mongooseModels/createMongooseModel';
import composeNearForAggregateInput from '@/resolvers/utils/composeNearForAggregateInput';
import getFilterFromInvolvedFilters from '@/resolvers/utils/getFilterFromInvolvedFilters';
import mergeWhereAndFilter from '@/resolvers/utils/mergeWhereAndFilter';
import getProjectionFromInfo from '@/resolvers/utils/getProjectionFromInfo';

const getPrevious: GetPrevious = async (
  actionGeneralName,
  resolverCreatorArg,
  resolverArg,
  session,
) => {
  const { entityConfig, generalConfig } = resolverCreatorArg;
  const {
    args,
    context,
    resolverOptions: { involvedFilters },
  } = resolverArg;
  const { enums } = generalConfig;

  const { filter } = getFilterFromInvolvedFilters(involvedFilters);

  if (!filter) return null;

  const { near, where, search } = args;

  const { mongooseConn } = context;

  const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

  const { lookups, where: preConditions } = mergeWhereAndFilter(filter, where, entityConfig) || {};

  let conditions = preConditions;

  if (lookups.length > 0 || near || search) {
    const pipeline = [...lookups];

    if (near) {
      const geoNear = composeNearForAggregateInput(near as NearInput, entityConfig);

      pipeline.unshift({ $geoNear: geoNear });
    }

    if (search) {
      pipeline.unshift({ $match: { $text: { $search: search } } });
    }

    if (Object.keys(conditions).length > 0) {
      pipeline.push({ $match: conditions });
    }

    pipeline.push({ $project: { _id: 1 } });

    const entities = await (session
      ? Entity.aggregate(pipeline).session(session).exec()
      : Entity.aggregate(pipeline).exec());

    if (!entities) return null;

    if (!entities.length) return [];

    conditions = { _id: { $in: entities.map(({ _id }) => _id) } };
  }

  const projection = getProjectionFromInfo(entityConfig as TangibleEntityConfig, resolverArg);

  ((entityConfig as TangibleEntityConfig).duplexFields || []).reduce((prev, { name: name2 }) => {
    prev[name2] = 1;
    return prev;
  }, projection);

  const entities = await Entity.find(conditions, projection, { lean: true, session });

  return entities;
};

export default getPrevious;
