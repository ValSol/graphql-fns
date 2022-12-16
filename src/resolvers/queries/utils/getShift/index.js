// @flow

import mongoose from 'mongoose';

import type { ResolverArg, ResolverCreatorArg } from '../../../flowTypes';

import createMongooseModel from '../../../../mongooseModels/createMongooseModel';
import composeNearForAggregateInput from '../../../utils/composeNearForAggregateInput';
import mergeWhereAndFilter from '../../../utils/mergeWhereAndFilter';
import composeLimitingArgs from './composeLimitingArgs';
import composeProjectionFromArgs from './composeProjectionFromArgs';
import composeSetWindowFieldsInput from './composeSetWindowFieldsInput';

const getShift = async (
  _id: string,
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
  filter: Object,
  entityQueryResolver: Function,
): Promise<null | number> => {
  const { entityConfig, generalConfig } = resolverCreatorArg;
  const { parent, args, context } = resolverArg;

  const { enums } = generalConfig;

  const projection = composeProjectionFromArgs(args);

  // eslint-disable-next-line no-await-in-loop
  const thing = await entityQueryResolver(
    parent,
    { whereOne: { id: _id } },
    context,
    { projection },
    filter,
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

  if (Object.keys(where2).length) {
    pipeline.push({ $match: where2 });
  }

  if (objectIdsFromParent) {
    pipeline.push({
      $set: { index_from_parent_ids: { $indexOfArray: [objectIdsFromParent, '$_id'] } },
    });
    pipeline.push({ $sort: { index_from_parent_ids: 1 } });
  }

  pipeline.push({ $setWindowFields: composeSetWindowFieldsInput(limitingArgs) });

  const $eq = mongoose.mongo.ObjectId(_id);

  pipeline.push({ $match: { _id: { $eq } } });

  const [{ calculated_number: calculatedNumber }] = await Entity.aggregate(pipeline).exec();

  return calculatedNumber - 1;
};

export default getShift;
