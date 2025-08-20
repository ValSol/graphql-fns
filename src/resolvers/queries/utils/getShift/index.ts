import mongoose from 'mongoose';

import type { DataObject, InvolvedFilter, ResolverArg, ResolverCreatorArg } from '@/tsTypes';

import createMongooseModel from '@/mongooseModels/createMongooseModel';
import composeNearForAggregateInput from '@/resolvers/utils/composeNearForAggregateInput';
import createInfoEssence from '@/resolvers/utils/createInfoEssence';
import getFilterFromInvolvedFilters from '@/resolvers/utils/getFilterFromInvolvedFilters';
import mergeWhereAndFilter from '@/resolvers/utils/mergeWhereAndFilter';
import composeLimitingArgs from './composeLimitingArgs';
import composeProjectionFromArgs from './composeProjectionFromArgs';
import composeSetWindowFieldsInput from './composeSetWindowFieldsInput';

const getShift = async (
  _id: string,
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
  involvedFilters: {
    [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
  },
  entityQueryResolver: any,
): Promise<null | number> => {
  const { entityConfig, generalConfig } = resolverCreatorArg;
  const { parent, args, context } = resolverArg;

  const { enums } = generalConfig;

  const projection = composeProjectionFromArgs(args);

  const { filter } = getFilterFromInvolvedFilters(involvedFilters);

  if (!filter) return null;

  const thing = await entityQueryResolver(
    parent,
    { whereOne: { id: _id } },
    context,
    createInfoEssence(projection),
    involvedFilters,
  );

  if (!thing) return null;

  const limitingArgs = composeLimitingArgs(args, thing);

  const {
    near,
    where,
    search,
    objectIds_from_parent: objectIdsFromParent, // "objectIds_from_parent" used only to process the call from createChildEntitiesThroughConnectionQueryResolver
  } = limitingArgs;

  // very same code as ...
  // ...at: src/resolvers/queries/createEntitiesThroughConnectionQueryResolver/getShift/index.js

  const { mongooseConn } = context;

  const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

  const { lookups, where: where2 } = mergeWhereAndFilter(filter, where, entityConfig);

  const pipeline = [...lookups];

  if (near) {
    const geoNear = composeNearForAggregateInput(near);

    pipeline.unshift({ $geoNear: geoNear });
  }

  if (search) {
    pipeline.unshift({ $sort: { score: { $meta: 'textScore' } } });
    pipeline.unshift({ $match: { $text: { $search: search } } });
  }

  if (Object.keys(where2).length > 0) {
    pipeline.push({ $match: where2 });
  }

  if (objectIdsFromParent) {
    pipeline.push({
      $set: { index_from_parent_ids: { $indexOfArray: [objectIdsFromParent, '$_id'] } },
    });
    pipeline.push({ $sort: { index_from_parent_ids: 1 } });
  }

  pipeline.push({ $setWindowFields: composeSetWindowFieldsInput(limitingArgs) });

  const $eq = new mongoose.Types.ObjectId(_id);

  const $match = { _id: { $eq } } as unknown as DataObject;

  pipeline.push({ $match });

  const [{ calculated_number: calculatedNumber }] = await Entity.aggregate(pipeline).exec();

  return calculatedNumber - 1;
};

export default getShift;
