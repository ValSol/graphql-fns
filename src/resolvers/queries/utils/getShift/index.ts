import mongoose from 'mongoose';

import type { DataObject, InvolvedFilter, ResolverArg, ResolverCreatorArg } from '@/tsTypes';

import createMongooseModel from '@/mongooseModels/createMongooseModel';
import composeNearForAggregateInput from '@/resolvers/utils/composeNearForAggregateInput';
import createInfoEssence from '@/resolvers/utils/createInfoEssence';
import getFilterFromInvolvedFilters from '@/resolvers/utils/getFilterFromInvolvedFilters';
import composeAggregateHead from '@/resolvers/utils/mergeWhereAndFilter/composeAggregateHead';
import mergeWhereAndFilter from '@/resolvers/utils/mergeWhereAndFilter';
import composeLimitingArgs from './composeLimitingArgs';
import composeProjectionFromArgs from './composeProjectionFromArgs';
import composeSetWindowFieldsInput from './composeSetWindowFieldsInput';

// used only by "getSkipConnection": for "near" and "search" without "sort"
const getShift = async (
  _id: string,
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
  involvedFilters: {
    [representationConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
  },
  entityQueryResolver: any,
): Promise<null | number> => {
  const { entityConfig, generalConfig } = resolverCreatorArg;
  const { parent, args, context } = resolverArg;

  const { enums } = generalConfig;

  const projection = composeProjectionFromArgs(args);

  const { filter } = getFilterFromInvolvedFilters(involvedFilters);

  if (!filter) return null;

  const entity = await entityQueryResolver(
    parent,
    { whereOne: { id: _id } },
    context,
    createInfoEssence({ projection }),
    { ...resolverArg.resolverOptions, involvedFilters },
  );

  if (!entity) return null;

  const limitingArgs = composeLimitingArgs(args, entity);

  const { near, where, search } = limitingArgs;

  const { mongooseConn } = context;

  const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

  const { lookups, where: where2 } = mergeWhereAndFilter(filter, where, entityConfig);

  const pipeline = composeAggregateHead({
    where: where2,
    lookups,
    geoNear: near ? composeNearForAggregateInput(near, entityConfig) : undefined,
    search,
    sortByTextScore: true,
  });

  pipeline.push({ $setWindowFields: composeSetWindowFieldsInput(limitingArgs) });

  const $eq = new mongoose.Types.ObjectId(_id);

  const $match = { _id: { $eq } } as unknown as DataObject;

  pipeline.push({ $match });

  const [result] = await Entity.aggregate(pipeline).exec();

  // the cursor entity no longer matches "where": as if it were deleted
  if (!result) return null;

  return result.calculated_number - 1;
};

export default getShift;
