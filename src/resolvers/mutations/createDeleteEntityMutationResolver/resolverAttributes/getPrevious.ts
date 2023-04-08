import type { GetPrevious } from '../../../tsTypes';

import createMongooseModel from '../../../../mongooseModels/createMongooseModel';
import getFilterFromInvolvedFilters from '../../../utils/getFilterFromInvolvedFilters';
import mergeWhereAndFilter from '../../../utils/mergeWhereAndFilter';

const getPrevious: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { entityConfig, generalConfig } = resolverCreatorArg;
  const { args, context, involvedFilters } = resolverArg;
  const { enums } = generalConfig;

  const filter = getFilterFromInvolvedFilters(involvedFilters);

  if (!filter) return null;

  const { whereOne } = args;

  const { mongooseConn } = context;

  const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

  const whereOneKeys = Object.keys(whereOne);
  if (whereOneKeys.length !== 1) {
    throw new TypeError(
      `Expected exactly one key in whereOne arg!, but have: ${whereOneKeys.length}!`,
    );
  }

  const { lookups, where: preConditions } = mergeWhereAndFilter(filter, whereOne, entityConfig);

  let conditions = preConditions;

  if (lookups.length) {
    const pipeline = [...lookups];

    if (Object.keys(preConditions).length) {
      pipeline.push({ $match: preConditions });
    }

    pipeline.push({ $project: { _id: 1 } });

    const [entity] = await Entity.aggregate(pipeline).exec();

    if (!entity) return null;

    conditions = { _id: entity._id }; // eslint-disable-line no-underscore-dangle
  }

  const entity = await Entity.findOne(conditions, null, { lean: true });
  if (!entity) return null;

  return [entity];
};

export default getPrevious;
