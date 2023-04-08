import type { NearInput, TangibleEntityConfig } from '../../../../tsTypes';
import type { GetPrevious } from '../../../tsTypes';

import createMongooseModel from '../../../../mongooseModels/createMongooseModel';
import composeNearForAggregateInput from '../../../utils/composeNearForAggregateInput';
import getInputAndOutputFilters from '../../../utils/getInputAndOutputFilters';
import mergeWhereAndFilter from '../../../utils/mergeWhereAndFilter';
import checkData from '../../checkData';

const get: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { entityConfig, generalConfig, serversideConfig } = resolverCreatorArg;
  const { args, context, involvedFilters } = resolverArg;
  const { enums } = generalConfig;

  const { inputFilter, outputFilter } = getInputAndOutputFilters(involvedFilters);

  if (!inputFilter || !outputFilter) return null;

  const { data, near, where, search } = args;

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

  const { lookups, where: preConditions } = mergeWhereAndFilter(inputFilter, where, entityConfig);

  let conditions = preConditions;

  if (lookups.length || near || search) {
    const pipeline = [...lookups];

    if (near) {
      const geoNear = composeNearForAggregateInput(near as NearInput);

      pipeline.unshift({ $geoNear: geoNear });
    }

    if (search) {
      pipeline.unshift({ $match: { $text: { $search: search } } });
    }

    if (Object.keys(conditions).length) {
      pipeline.push({ $match: conditions });
    }

    pipeline.push({ $project: { _id: 1 } });

    const entities = await Entity.aggregate(pipeline).exec();

    if (!entities) return null;

    if (!entities.length) return [];

    conditions = { _id: { $in: entities.map(({ _id }) => _id) } };
  }

  const previousEntities = await Entity.find(conditions, duplexFieldsProjection, { lean: true });

  const previousEntities2: Array<any> = [];
  const processingKind = 'update';
  for (let i = 0; i < previousEntities.length; i += 1) {
    const previousEntity = previousEntities[i];
    const { _id: id } = previousEntity;

    // eslint-disable-next-line no-await-in-loop
    const allowCreate = await checkData(
      { data, whereOne: { id } },
      outputFilter,
      entityConfig,
      processingKind,
      generalConfig,
      serversideConfig,
      context,
    );

    if (allowCreate) previousEntities2.push(previousEntity);
  }

  return previousEntities2;
};

export default get;
