import {
  DataObject,
  GraphqlObject,
  InvolvedFilter,
  TangibleEntityConfig,
} from '../../../../tsTypes';
import type { GetPrevious } from '../../../tsTypes';

import createMongooseModel from '../../../../mongooseModels/createMongooseModel';
import getInputAndOutputFilters from '../../../utils/getInputAndOutputFilters';
import mergeWhereAndFilter from '../../../utils/mergeWhereAndFilter';
import checkData from '../../checkData';

const get: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg, session) => {
  const { entityConfig, generalConfig, serversideConfig } = resolverCreatorArg;
  const { args, context, involvedFilters } = resolverArg;
  const { enums } = generalConfig;

  const { inputFilter, outputFilter } = getInputAndOutputFilters(involvedFilters);

  if (!inputFilter || !outputFilter) return null;

  const { data, whereOne } = args as { data: GraphqlObject[]; whereOne: InvolvedFilter[] };

  if (whereOne.length !== data.length) {
    throw new TypeError(
      `Length of whereOne is "${whereOne.length}", length of data is "${data.length}" but have to be equal!`,
    );
  }

  if (!whereOne.length) return [];

  const [whereKey] = Object.keys(whereOne[0]);

  const incorrectWhreOneItem = whereOne.find((item) => !item[whereKey]);
  if (incorrectWhreOneItem) {
    throw new TypeError(
      `Incorrect key in whereOne item: "${JSON.stringify(
        incorrectWhreOneItem,
      )}" instead of "${whereKey}"!`,
    );
  }

  const processingKind = 'update';
  for (let i = 0; i < data.length; i += 1) {
    const allowUpdate = await checkData(
      resolverCreatorArg,
      { ...resolverArg, args: { data: data[i], whereOne: whereOne[i] } },
      outputFilter,
      processingKind,
      session,
    );

    if (!allowUpdate) return null;
  }

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

  if (whereKey !== 'id') {
    duplexFieldsProjection[whereKey] = 1;
  }

  const { lookups, where: whereOne2 } = mergeWhereAndFilter(
    inputFilter,
    { OR: whereOne },
    entityConfig,
  );

  let whereOne3 = whereOne2;

  if (lookups.length) {
    const pipeline = [...lookups];

    if (Object.keys(whereOne2).length) {
      pipeline.push({ $match: whereOne2 });
    }

    pipeline.push({ $project: { _id: 1 } });

    const entities = await (session
      ? Entity.aggregate(pipeline).session(session).exec()
      : Entity.aggregate(pipeline).exec());

    if (!entities || entities.length !== whereOne.length) return null;

    whereOne3 = { _id: { $in: entities.map(({ _id }) => _id) } };
  }

  const previousEntities: DataObject[] = await Entity.find(whereOne3, duplexFieldsProjection, {
    lean: true,
    session,
  });

  if (!previousEntities || previousEntities.length !== whereOne.length) return null;

  const whereKey2 = whereKey === 'id' ? '_id' : whereKey;

  const previousentitiesObject = previousEntities.reduce(
    (prev, entity) => {
      prev[entity[whereKey2]] = entity;
      return prev;
    },
    {} as { [id: string]: DataObject },
  );

  const result = whereOne.map(
    ({ [whereKey]: key }) => previousentitiesObject[key as unknown as string] as GraphqlObject,
  );

  return result;
};

export default get;
