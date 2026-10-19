import type {
  InvolvedFilter,
  ResolverArg,
  ResolverCreatorArg,
  TangibleEntityConfig,
} from '@/tsTypes';

import createMongooseModel from '@/mongooseModels/createMongooseModel';
import adaptProjectionForCalculatedFields from '@/resolvers/utils/adaptProjectionForCalculatedFields';
import getCalculatedFieldsConfig from '@/resolvers/utils/getCalculatedFieldsConfig';
import getProjectionFromInfo from '@/resolvers/utils/getProjectionFromInfo';
import composeAggregateHead from '@/resolvers/utils/mergeWhereAndFilter/composeAggregateHead';
import mergeWhereAndFilter from '@/resolvers/utils/mergeWhereAndFilter';

// return entity selected by "whereOne" / "whereCompoundOne" (as "entity" query does) among...
// ... entities available by "filter", or "null" if it is not found
const findEntity = async (
  where: InvolvedFilter,
  filter: InvolvedFilter[],
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
  session: any,
): Promise<null | Record<string, any>> => {
  const { entityConfig, generalConfig, serversideConfig } = resolverCreatorArg;
  const {
    context: { mongooseConn },
  } = resolverArg;

  const Entity = await createMongooseModel(mongooseConn, entityConfig, generalConfig.enums);

  const { lookups, where: where2 } = mergeWhereAndFilter(filter, where, entityConfig);

  let where3 = where2;

  if (lookups.length > 0) {
    const pipeline = composeAggregateHead({ where: where2, lookups });

    pipeline.push({ $project: { _id: 1 } });

    const [entity] = await (session
      ? Entity.aggregate(pipeline).session(session).exec()
      : Entity.aggregate(pipeline).exec());

    if (!entity) return null;

    where3 = { _id: entity._id };
  }

  const projection = adaptProjectionForCalculatedFields(
    getProjectionFromInfo(entityConfig as TangibleEntityConfig, resolverArg),
    getCalculatedFieldsConfig(resolverCreatorArg, resolverArg),
    generalConfig,
    serversideConfig,
  );

  return Entity.findOne(where3, projection, { lean: true, session });
};

export default findEntity;
