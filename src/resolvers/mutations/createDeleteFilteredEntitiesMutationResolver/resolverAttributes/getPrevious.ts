import type { NearInput, TangibleEntityConfig } from '@/tsTypes';
import type { GetPrevious } from '@/resolvers/tsTypes';

import createMongooseModel from '@/mongooseModels/createMongooseModel';
import composeNearForAggregateInput from '@/resolvers/utils/composeNearForAggregateInput';
import getFilterFromInvolvedFilters from '@/resolvers/utils/getFilterFromInvolvedFilters';
import aggregateFilteredIds from '@/resolvers/utils/aggregateFilteredIds';
import mergeWhereAndFilter from '@/resolvers/utils/mergeWhereAndFilter';
import adaptProjectionForCalculatedFields from '@/resolvers/utils/adaptProjectionForCalculatedFields';
import getCalculatedFieldsConfig from '@/resolvers/utils/getCalculatedFieldsConfig';
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
    const ids = await aggregateFilteredIds(
      Entity,
      {
        where: conditions,
        lookups,
        geoNear: near ? composeNearForAggregateInput(near as NearInput, entityConfig) : undefined,
        search: search as string | undefined,
      },
      session,
    );

    if (!ids) return null;

    if (!ids.length) return [];

    conditions = { _id: { $in: ids } };
  }

  const projection = adaptProjectionForCalculatedFields(
    getProjectionFromInfo(entityConfig as TangibleEntityConfig, resolverArg),
    getCalculatedFieldsConfig(resolverCreatorArg, resolverArg),
    generalConfig,
    resolverCreatorArg.serversideConfig,
  );

  ((entityConfig as TangibleEntityConfig).duplexFields || []).reduce((prev, { name: name2 }) => {
    prev[name2] = 1;
    return prev;
  }, projection);

  const entities = await Entity.find(conditions, projection, { lean: true, session });

  return entities;
};

export default getPrevious;
