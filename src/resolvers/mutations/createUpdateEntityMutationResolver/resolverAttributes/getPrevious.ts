import type { GetPrevious } from '../../../tsTypes';

import createMongooseModel from '../../../../mongooseModels/createMongooseModel';
import getInputAndOutputFilters from '../../../utils/getInputAndOutputFilters';
import mergeWhereAndFilter from '../../../utils/mergeWhereAndFilter';
import checkData from '../../checkData';
import { TangibleEntityConfig } from '../../../../tsTypes';
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

  const { subscribeUpdatedEntity } = involvedFilters;

  const { inputFilter, outputFilter } = getInputAndOutputFilters(involvedFilters);

  if (!inputFilter || !outputFilter) return null;

  const { whereOne } = args;

  const processingKind = 'update';
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

  const { duplexFields } = entityConfig as TangibleEntityConfig;
  const duplexFieldsProjection = duplexFields
    ? duplexFields.reduce(
        (prev, { name: name2 }) => {
          prev[name2] = 1;
          return prev;
        },
        { _id: 1 },
      )
    : {};

  const { lookups, where: whereOne2 } = mergeWhereAndFilter(inputFilter, whereOne, entityConfig);

  let whereOne3 = whereOne2;

  if (lookups.length > 0) {
    const pipeline = [...lookups];

    if (Object.keys(whereOne2).length > 0) {
      pipeline.push({ $match: whereOne2 });
    }

    pipeline.push({ $project: { _id: 1 } });

    const [entity] = await (session
      ? Entity.aggregate(pipeline).session(session).exec()
      : Entity.aggregate(pipeline).exec());

    if (!entity) return null;

    whereOne3 = { _id: entity._id };
  }

  // const projection = subscribeUpdatedEntity
  //   ? {} // if subsciption ON - return empty projection - to get all fields of entity
  //   : { duplexFieldsProjection };

  const projection = getProjectionFromInfo(entityConfig as TangibleEntityConfig, resolverArg);

  const previousEntity = await Entity.findOne(whereOne3, projection, { lean: true, session });

  return previousEntity && [previousEntity];
};

export default getPrevious;
