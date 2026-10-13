import type { TangibleEntityConfig } from '@/tsTypes';
import type { GetPrevious } from '@/resolvers/tsTypes';

import createMongooseModel from '@/mongooseModels/createMongooseModel';
import checkWhereOneArgs from '@/resolvers/utils/checkWhereOneArgs';
import adaptProjectionForCalculatedFields from '@/resolvers/utils/adaptProjectionForCalculatedFields';
import getCalculatedFieldsConfig from '@/resolvers/utils/getCalculatedFieldsConfig';
import getFilterFromInvolvedFilters from '@/resolvers/utils/getFilterFromInvolvedFilters';
import getProjectionFromInfo from '@/resolvers/utils/getProjectionFromInfo';
import composeAggregateHead from '@/resolvers/utils/mergeWhereAndFilter/composeAggregateHead';
import mergeWhereAndFilter from '@/resolvers/utils/mergeWhereAndFilter';
import createEntityGetPrevious from '../../createCreateEntityMutationResolver/resolverAttributes/getPrevious';
import composeDataToCreate from './composeDataToCreate';

// return found entity (as "entity" query does) or "[]" if entity has to be created
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

  const { whereOne, whereCompoundOne } = args as Record<string, any>;

  checkWhereOneArgs(whereOne, whereCompoundOne, entityConfig);

  const { mongooseConn } = context;

  const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

  const { lookups, where } = mergeWhereAndFilter(
    filter,
    whereOne || whereCompoundOne,
    entityConfig,
  );

  let where2 = where;

  if (lookups.length > 0) {
    const pipeline = composeAggregateHead({ where, lookups });

    pipeline.push({ $project: { _id: 1 } });

    const [entity] = await (session
      ? Entity.aggregate(pipeline).session(session).exec()
      : Entity.aggregate(pipeline).exec());

    where2 = entity ? { _id: entity._id } : null;
  }

  if (where2) {
    const projection = adaptProjectionForCalculatedFields(
      getProjectionFromInfo(entityConfig as TangibleEntityConfig, resolverArg),
      getCalculatedFieldsConfig(resolverCreatorArg, resolverArg),
      generalConfig,
      resolverCreatorArg.serversideConfig,
    );

    const previousEntity = await Entity.findOne(where2, projection, { lean: true, session });

    if (previousEntity) return [previousEntity];
  }

  // not found: check that entity with "data" (completed by "whereOne" / "whereCompoundOne")...
  // ... may be created
  return createEntityGetPrevious(
    actionGeneralName,
    resolverCreatorArg,
    { ...resolverArg, args: { ...args, data: composeDataToCreate(args, entityConfig) } },
    session,
  );
};

export default getPrevious;
