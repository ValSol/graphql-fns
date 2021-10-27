// @flow

import type { GetPrevious } from '../../../flowTypes';

import executeAuthorisation from '../../../utils/executeAuthorisation';
import createThing from '../../../../mongooseModels/createThing';
import mergeWhereAndFilter from '../../../utils/mergeWhereAndFilter';
import checkData from '../../checkData';

const get: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { thingConfig, generalConfig, serversideConfig, inAnyCase } = resolverCreatorArg;
  const { args, context, parentFilter } = resolverArg;
  const { enums } = generalConfig;
  const { name } = thingConfig;

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
      thingConfig,
      processingKind,
      generalConfig,
      serversideConfig,
      context,
    );

    if (!allowCreate) return null;
  }

  const { mongooseConn } = context;

  const Thing = await createThing(mongooseConn, thingConfig, enums);

  const { duplexFields } = thingConfig;
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

  const { lookups, where: whereOne2 } = mergeWhereAndFilter(filter, { OR: whereOne }, thingConfig);

  let whereOne3 = whereOne2;

  if (lookups.length) {
    const arg = [...lookups];

    if (Object.keys(whereOne2).length) {
      arg.push({ $match: whereOne2 });
    }

    arg.push({ $project: { _id: 1 } });

    const things = await Thing.aggregate(arg).exec();

    if (!things || things.length !== whereOne.length) return null;

    whereOne3 = { _id: { $in: things.map(({ _id }) => _id) } }; // eslint-disable-line no-underscore-dangle
  }

  const previousThings = await Thing.find(whereOne3, duplexFieldsProjection, { lean: true });

  if (!previousThings || previousThings.length !== whereOne.length) return null;

  const whereKey2 = whereKey === 'id' ? '_id' : whereKey;

  const previousThingsObject = previousThings.reduce((prev, thing) => {
    prev[thing[whereKey2]] = thing; // eslint-disable-line no-param-reassign
    return prev;
  }, {});

  const result = whereOne.map(({ [whereKey]: key }) => previousThingsObject[key]);

  return result;
};

export default get;
