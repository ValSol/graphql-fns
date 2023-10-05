import type { NearInput, TangibleEntityConfig } from '../../../../tsTypes';
import type { GetPrevious } from '../../../tsTypes';

import createMongooseModel from '../../../../mongooseModels/createMongooseModel';
import composeNearForAggregateInput from '../../../utils/composeNearForAggregateInput';
import getFilterFromInvolvedFilters from '../../../utils/getFilterFromInvolvedFilters';
import mergeWhereAndFilter from '../../../utils/mergeWhereAndFilter';
import getProjectionFromInfo from '../../../utils/getProjectionFromInfo';

const get: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { entityConfig, generalConfig } = resolverCreatorArg;
  const { args, context, involvedFilters } = resolverArg;
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
      const geoNear = composeNearForAggregateInput(near as NearInput);

      pipeline.unshift({ $geoNear: geoNear });
    }

    if (search) {
      pipeline.unshift({ $match: { $text: { $search: search } } });
    }

    if (Object.keys(conditions).length > 0) {
      pipeline.push({ $match: conditions });
    }

    pipeline.push({ $project: { _id: 1 } });

    const entities = await Entity.aggregate(pipeline).exec();

    if (!entities) return null;

    if (!entities.length) return [];

    conditions = { _id: { $in: entities.map(({ _id }) => _id) } };
  }

  const projection = getProjectionFromInfo(entityConfig as TangibleEntityConfig, resolverArg);

  ((entityConfig as TangibleEntityConfig).duplexFields || []).reduce((prev, { name: name2 }) => {
    prev[name2] = 1; // eslint-disable-line no-param-reassign
    return prev;
  }, projection);

  const entities = await Entity.find(conditions, projection, { lean: true });

  return entities;
};

export default get;
