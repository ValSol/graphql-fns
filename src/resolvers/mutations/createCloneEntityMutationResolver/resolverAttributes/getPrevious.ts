import type { GetPrevious } from '../../../tsTypes';

import createMongooseModel from '../../../../mongooseModels/createMongooseModel';
import composeFieldsObject from '../../../../utils/composeFieldsObject';
import getFilterFromInvolvedFilters from '../../../utils/getFilterFromInvolvedFilters';
import mergeWhereAndFilter from '../../../utils/mergeWhereAndFilter';
import checkData from '../../checkData';

const getPrevious: GetPrevious = async (
  actionGeneralName,
  resolverCreatorArg,
  resolverArg,
  session: any,
) => {
  const { entityConfig, generalConfig, serversideConfig } = resolverCreatorArg;
  const { args, context, involvedFilters } = resolverArg;
  const { enums } = generalConfig;

  const { filter } = getFilterFromInvolvedFilters(involvedFilters);

  if (!filter) return null;

  const { whereOne, data = {} } = args;

  const { mongooseConn } = context;

  const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

  const whereOneKeys = Object.keys(whereOne);
  if (whereOneKeys.length !== 1) {
    throw new TypeError(
      `Expected exactly one key in whereOne arg!, but have: ${whereOneKeys.length}!`,
    );
  }

  const fieldsObject = composeFieldsObject(entityConfig);

  const $project = Object.keys(fieldsObject).reduce<Record<string, 1>>(
    (prev, fieldName) => {
      if (
        data[fieldName] === undefined ||
        (fieldsObject[fieldName].type !== 'duplexFields' &&
          fieldsObject[fieldName].type !== 'relationalFields')
      ) {
        prev[fieldName] = 1;
      }

      return prev;
    },
    { _id: 1 },
  );

  const { lookups, where: preConditions } = mergeWhereAndFilter(filter, whereOne, entityConfig);

  const conditions = preConditions;

  let entity;

  if (lookups.length > 0) {
    const pipeline = [...lookups];

    if (Object.keys(preConditions).length > 0) {
      pipeline.push({ $match: preConditions });
    }

    pipeline.push({ $project });

    const entities = await (session
      ? Entity.aggregate(pipeline).session(session).exec()
      : Entity.aggregate(pipeline).exec());

    entity = entities[0];
  } else {
    entity = await Entity.findOne(conditions, $project, { lean: true, session });
  }

  if (!entity) return null;

  const processingKind = 'create';
  const allowCreate = await checkData(
    resolverCreatorArg,
    resolverArg,
    filter,
    processingKind,
    session,
  );

  return allowCreate && [];
};

export default getPrevious;
