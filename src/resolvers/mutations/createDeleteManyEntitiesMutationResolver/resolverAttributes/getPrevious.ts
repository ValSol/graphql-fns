import type { InvolvedFilter, TangibleEntityConfig } from '../../../../tsTypes';
import type { GetPrevious } from '../../../tsTypes';

import createMongooseModel from '../../../../mongooseModels/createMongooseModel';
import getFilterFromInvolvedFilters from '../../../utils/getFilterFromInvolvedFilters';
import mergeWhereAndFilter from '../../../utils/mergeWhereAndFilter';
import getProjectionFromInfo from '../../../utils/getProjectionFromInfo';

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

  const { lookups, where: preConditions } = mergeWhereAndFilter(
    filter,
    { OR: whereOne },
    entityConfig,
  );

  let conditions = preConditions;

  if (lookups.length > 0) {
    const pipeline = [...lookups];

    if (Object.keys(preConditions).length > 0) {
      pipeline.push({ $match: preConditions });
    }

    pipeline.push({ $project: { _id: 1 } });

    const entities = await (session
      ? Entity.aggregate(pipeline).session(session).exec()
      : Entity.aggregate(pipeline).exec());

    if (entities.length !== whereOne.length) return null;

    conditions = { _id: { $in: entities.map(({ _id }) => _id) } };
  }

  const projection = getProjectionFromInfo(entityConfig as TangibleEntityConfig, resolverArg);

  ((entityConfig as TangibleEntityConfig).duplexFields || []).reduce((prev, { name: name2 }) => {
    prev[name2] = 1;
    return prev;
  }, projection);

  const entities = await Entity.find(conditions, projection, { lean: true, session });
  if (entities.length !== whereOne.length) return null;

  return entities;
};

export default getPrevious;
