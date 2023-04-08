import type { GetPrevious } from '../../../tsTypes';

import createMongooseModel from '../../../../mongooseModels/createMongooseModel';
import getInputAndOutputFilters from '../../../utils/getInputAndOutputFilters';
import mergeWhereAndFilter from '../../../utils/mergeWhereAndFilter';
import checkData from '../../checkData';
import { EntityConfigObject, TangibleEntityConfig } from '../../../../tsTypes';

const get: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { entityConfig, generalConfig, serversideConfig } = resolverCreatorArg;
  const { args, context, involvedFilters } = resolverArg;
  const { enums } = generalConfig;

  const { subscribeUpdatedEntity } = involvedFilters;

  const { inputFilter, outputFilter } = getInputAndOutputFilters(involvedFilters);

  if (!inputFilter || !outputFilter) return null;

  const { whereOne } = args;

  const processingKind = 'update';
  const allowCreate = await checkData(
    args,
    outputFilter,
    entityConfig,
    processingKind,
    generalConfig,
    serversideConfig,
    context,
  );

  if (!allowCreate) return null;

  const { mongooseConn } = context;

  const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

  const { duplexFields } = entityConfig as TangibleEntityConfig;
  const duplexFieldsProjection = duplexFields
    ? duplexFields.reduce(
        (prev, { name: name2 }) => {
          prev[name2] = 1; // eslint-disable-line no-param-reassign
          return prev;
        },
        { _id: 1 },
      )
    : {};

  const { lookups, where: whereOne2 } = mergeWhereAndFilter(inputFilter, whereOne, entityConfig);

  let whereOne3 = whereOne2;

  if (lookups.length) {
    const pipeline = [...lookups];

    if (Object.keys(whereOne2).length) {
      pipeline.push({ $match: whereOne2 });
    }

    pipeline.push({ $project: { _id: 1 } });

    const [entity] = await Entity.aggregate(pipeline).exec();

    if (!entity) return null;

    whereOne3 = { _id: entity._id }; // eslint-disable-line no-underscore-dangle
  }

  const projection = subscribeUpdatedEntity
    ? {} // if subsciption ON - return empty projection - to get all fields of entity
    : duplexFieldsProjection;

  const previousEntity = await Entity.findOne(whereOne3, projection, { lean: true });

  return previousEntity && [previousEntity];
};

export default get;
