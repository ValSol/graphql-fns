// @flow
import type { GetPrevious } from '../../../flowTypes';

import createMongooseModel from '../../../../mongooseModels/createMongooseModel';
import mergeWhereAndFilter from '../../../utils/mergeWhereAndFilter';
import getProjectionFromInfo from '../../../utils/getProjectionFromInfo';

const get: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { entityConfig, generalConfig } = resolverCreatorArg;
  const { args, context, info, parentFilters } = resolverArg;
  const { enums } = generalConfig;

  const { foo: filter } = parentFilters;

  if (!filter) return null;

  const { whereOne } = args;

  const { mongooseConn } = context;

  const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

  whereOne.forEach((item) => {
    const whereOneKeys = Object.keys(item);
    if (whereOneKeys.length !== 1) {
      throw new TypeError('Expected exactly one key in where arg!');
    }
  });

  if (!whereOne.length) return [];

  const { lookups, where: preConditions } = mergeWhereAndFilter(
    filter,
    { OR: whereOne },
    entityConfig,
  );

  let conditions = preConditions;

  if (lookups.length) {
    const arg = [...lookups];

    if (Object.keys(preConditions).length) {
      arg.push({ $match: preConditions });
    }

    arg.push({ $project: { _id: 1 } });

    const entities = await Entity.aggregate(arg).exec();

    if (entities.length !== whereOne.length) return null;

    conditions = { _id: { $in: entities.map(({ _id }) => _id) } };
  }

  const projection = getProjectionFromInfo(info);

  (entityConfig.duplexFields || []).reduce((prev, { name: name2 }) => {
    prev[name2] = 1; // eslint-disable-line no-param-reassign
    return prev;
  }, projection);

  const entities = await Entity.find(conditions, projection, { lean: true });
  if (entities.length !== whereOne.length) return null;

  return entities;
};

export default get;
