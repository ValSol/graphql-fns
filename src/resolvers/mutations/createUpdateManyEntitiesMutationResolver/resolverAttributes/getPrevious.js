// @flow

import type { GetPrevious } from '../../../flowTypes';

import executeAuthorisation from '../../../utils/executeAuthorisation';
import createEntity from '../../../../mongooseModels/createThing';
import mergeWhereAndFilter from '../../../utils/mergeWhereAndFilter';
import checkData from '../../checkData';

const get: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { entityConfig, generalConfig, serversideConfig, inAnyCase } = resolverCreatorArg;
  const { args, context, parentFilter } = resolverArg;
  const { enums } = generalConfig;
  const { name } = entityConfig;

  const inventoryChain = ['Mutation', actionGeneralName, name];

  const filter = inAnyCase
    ? parentFilter
    : // $FlowFixMe
      await executeAuthorisation(inventoryChain, context, serversideConfig);

  if (!filter) return null;

  const { data, whereOne } = args;

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
    // eslint-disable-next-line no-await-in-loop
    const allowCreate = await checkData(
      { data: data[i], whereOne: whereOne[i] },
      filter,
      entityConfig,
      processingKind,
      generalConfig,
      serversideConfig,
      context,
    );

    if (!allowCreate) return null;
  }

  const { mongooseConn } = context;

  const Entity = await createEntity(mongooseConn, entityConfig, enums);

  const { duplexFields } = entityConfig;
  const duplexFieldsProjection = duplexFields
    ? duplexFields.reduce(
        (prev, { name: name2 }) => {
          prev[name2] = 1; // eslint-disable-line no-param-reassign
          return prev;
        },
        { _id: 1 },
      )
    : {};

  if (whereKey !== 'id') {
    duplexFieldsProjection[whereKey] = 1;
  }

  const { lookups, where: whereOne2 } = mergeWhereAndFilter(filter, { OR: whereOne }, entityConfig);

  let whereOne3 = whereOne2;

  if (lookups.length) {
    const arg = [...lookups];

    if (Object.keys(whereOne2).length) {
      arg.push({ $match: whereOne2 });
    }

    arg.push({ $project: { _id: 1 } });

    const entities = await Entity.aggregate(arg).exec();

    if (!entities || entities.length !== whereOne.length) return null;

    whereOne3 = { _id: { $in: entities.map(({ _id }) => _id) } }; // eslint-disable-line no-underscore-dangle
  }

  const previousEntities = await Entity.find(whereOne3, duplexFieldsProjection, { lean: true });

  if (!previousEntities || previousEntities.length !== whereOne.length) return null;

  const whereKey2 = whereKey === 'id' ? '_id' : whereKey;

  const previousentitiesObject = previousEntities.reduce((prev, entity) => {
    prev[entity[whereKey2]] = entity; // eslint-disable-line no-param-reassign
    return prev;
  }, {});

  const result = whereOne.map(({ [whereKey]: key }) => previousentitiesObject[key]);

  return result;
};

export default get;
