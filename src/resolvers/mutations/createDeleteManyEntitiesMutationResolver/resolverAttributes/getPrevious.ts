import type { InvolvedFilter, TangibleEntityConfig } from '@/tsTypes';
import type { GetPrevious } from '@/resolvers/tsTypes';

import createMongooseModel from '@/mongooseModels/createMongooseModel';
import getFilterFromInvolvedFilters from '@/resolvers/utils/getFilterFromInvolvedFilters';
import composeAggregateHead from '@/resolvers/utils/mergeWhereAndFilter/composeAggregateHead';
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

  const { whereOne } = args as { whereOne: InvolvedFilter[] };

  const { mongooseConn } = context;

  const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

  whereOne.forEach((item) => {
    const whereOneKeys = Object.keys(item);
    if (whereOneKeys.length !== 1) {
      throw new TypeError('Expected exactly one key in where arg!');
    }
  });

  if (whereOne.length === 0) return [];

  const { lookups, where } = mergeWhereAndFilter(filter, { OR: whereOne }, entityConfig);

  // every "whereOne" item is matched separately to return entities in the order of "whereOne"
  const $facet = whereOne.reduce<Record<string, Record<string, any>[]>>((prev, item, i) => {
    prev[`item${i}`] = [
      { $match: mergeWhereAndFilter([], item, entityConfig).where },
      { $project: { _id: 1 } },
    ];

    return prev;
  }, {});

  const pipeline = [...composeAggregateHead({ where, lookups }), { $facet }];

  const [facets] = await (session
    ? Entity.aggregate(pipeline).session(session).exec()
    : Entity.aggregate(pipeline).exec());

  if (whereOne.some((item, i) => facets[`item${i}`].length !== 1)) return null;

  const ids = whereOne.map((item, i) => facets[`item${i}`][0]._id);

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

  const entities = await Entity.find({ _id: { $in: ids } }, projection, { lean: true, session });
  if (entities.length !== whereOne.length) return null;

  const entitiesById = entities.reduce((prev, entity) => {
    prev[entity._id.toString()] = entity;
    return prev;
  }, {});

  return ids.map((id) => entitiesById[id.toString()]);
};

export default getPrevious;
