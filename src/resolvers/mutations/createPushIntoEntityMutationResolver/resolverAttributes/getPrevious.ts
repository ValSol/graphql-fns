import type { GetPrevious } from '@/resolvers/tsTypes';

import createMongooseModel from '@/mongooseModels/createMongooseModel';
import getInputAndOutputFilters from '@/resolvers/utils/getInputAndOutputFilters';
import mergeWhereAndFilter from '@/resolvers/utils/mergeWhereAndFilter';
import checkData from '@/resolvers/mutations/checkData';

const getPrevious: GetPrevious = async (
  actionGeneralName,
  resolverCreatorArg,
  resolverArg,
  session,
) => {
  const { entityConfig, generalConfig, serversideConfig } = resolverCreatorArg;
  const {
    args,
    context,
    resolverOptions: { involvedFilters },
  } = resolverArg;
  const { enums } = generalConfig;

  const { subscriptionUpdatedFilterAndLimit } = involvedFilters;

  const { inputFilter, outputFilter } = getInputAndOutputFilters(involvedFilters);

  if (!inputFilter || !outputFilter) return null;

  const {
    whereOne,
    whereOne: { id },
  } = args as { whereOne: { id?: string } };

  const processingKind = 'push';
  const allowCreate = await checkData(
    resolverCreatorArg,
    resolverArg,
    outputFilter,
    processingKind,
    session,
  );

  if (!allowCreate) return null;

  const { mongooseConn } = context;

  const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

  let _id = id;
  const whereOne2 = id ? { _id } : whereOne;
  const { lookups, where: whereOne3 } = mergeWhereAndFilter(inputFilter, whereOne, entityConfig);

  let conditions = whereOne3;

  if (lookups.length) {
    const pipeline = [...lookups];

    if (Object.keys(whereOne3).length) {
      pipeline.push({ $match: whereOne3 });
    }

    pipeline.push({ $project: { _id: 1 } });

    const [entity] = await (session
      ? Entity.aggregate(pipeline).session(session).exec()
      : Entity.aggregate(pipeline).exec());

    if (!entity) return null;

    conditions = { _id: entity._id };
  }

  let previousEntity: Record<string, any> = {};

  if (whereOne === whereOne2 || subscriptionUpdatedFilterAndLimit) {
    const projection = subscriptionUpdatedFilterAndLimit
      ? {} // if subsciption ON - return empty projection - to get all fields of entity
      : { _id: 1 };

    previousEntity = await Entity.findOne(conditions, projection, { lean: true, session });
    if (!previousEntity) return null;
    _id = previousEntity._id;
  }

  const entity = await Entity.findOne(conditions, { _id: 1 }, { lean: true, session });

  return entity && [entity];
};

export default getPrevious;
