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
import matchWhere from './matchWhere';

// return for every "where" ("whereOne" or "whereCompoundOne" of an item) the entity it selects among...
// ... entities available by "filter" or "null" if it is not found; all entities are got by one query...
// ... (and one "aggregate" if "filter" needs lookups) & then matched with "wheres" in memory
const findEntities = async (
  wheres: InvolvedFilter[],
  filter: InvolvedFilter[],
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
  session: any,
): Promise<Array<null | Record<string, any>>> => {
  if (wheres.length === 0) return [];

  const { entityConfig, generalConfig, serversideConfig } = resolverCreatorArg;
  const {
    context: { mongooseConn },
  } = resolverArg;

  const Entity = await createMongooseModel(mongooseConn, entityConfig, generalConfig.enums);

  const { lookups, where } = mergeWhereAndFilter(filter, { OR: wheres }, entityConfig);

  let where2 = where;

  if (lookups.length > 0) {
    const pipeline = composeAggregateHead({ where, lookups });

    pipeline.push({ $project: { _id: 1 } });

    const ids = await (session
      ? Entity.aggregate(pipeline).session(session).exec()
      : Entity.aggregate(pipeline).exec());

    if (ids.length === 0) return wheres.map(() => null);

    where2 = { _id: { $in: ids.map(({ _id }) => _id) } };
  }

  const projection = adaptProjectionForCalculatedFields(
    getProjectionFromInfo(entityConfig as TangibleEntityConfig, resolverArg),
    getCalculatedFieldsConfig(resolverCreatorArg, resolverArg),
    generalConfig,
    serversideConfig,
  );

  // fields of "wheres" are needed to match entities with "wheres"
  const projection2 =
    Object.keys(projection).length > 0
      ? wheres.reduce<Record<string, 1>>(
          (prev, item) => {
            Object.keys(item).forEach((key) => {
              if (key !== 'id') prev[key] = 1;
            });

            return prev;
          },
          { ...projection },
        )
      : projection;

  const entities: Record<string, any>[] = await Entity.find(where2, projection2, {
    lean: true,
    session,
  });

  return wheres.map(
    (item) => entities.find((entity) => matchWhere(entity, item as Record<string, any>)) || null,
  );
};

export default findEntities;
