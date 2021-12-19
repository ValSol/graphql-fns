// @flow

import type { GetPrevious } from '../../../flowTypes';

import createThing from '../../../../mongooseModels/createThing';
import getMatchingFields from '../../../../utils/getMatchingFields';
import getOppositeFields from '../../../../utils/getOppositeFields';
import coerceDataToGql from '../../../../utils/coerceDataToGql';
import executeAuthorisation from '../../../utils/executeAuthorisation';
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

  const { whereOnes, whereOne } = args;
  const whereOnesKeys = Object.keys(whereOnes);

  if (whereOnesKeys.length !== 1) {
    throw new TypeError(
      `Expected exactly one key in whereOnes arg!, but have: ${whereOnesKeys.length}!`,
    );
  }

  const { mongooseConn } = context;

  const [fieldName] = whereOnesKeys;

  const fieldsPair = getOppositeFields(thingConfig).find(
    ([{ name: name2 }]) => name2 === fieldName,
  );

  if (!fieldsPair) {
    throw new TypeError(`Not found duplex field: ${fieldName}!`);
  }

  const [{ array, config, oppositeName }, { array: oppositeArray }] = fieldsPair;

  const matchingFields = getMatchingFields(thingConfig, config);

  if (!matchingFields.length) {
    throw TypeError(
      `Expected at least one matching field in "${name}" and "${config.name}" things!`,
    );
  }

  const CopiedThing = await createThing(mongooseConn, config, enums);

  const thing = await CopiedThing.findOne(
    whereOnes[fieldName],
    matchingFields.reduce(
      (prev, matchingField) => {
        prev[matchingField] = 1; // eslint-disable-line no-param-reassign
        return prev;
      },
      { _id: 1, [oppositeName]: 1 },
    ),
    { lean: true },
  );

  if (!thing) return null;

  const rawData = matchingFields
    .filter((matchingField) => matchingField !== fieldName)
    .reduce((prev, matchingField) => {
      prev[matchingField] = thing[matchingField] === undefined ? null : thing[matchingField]; // eslint-disable-line no-param-reassign
      return prev;
    }, {});

  let id = null;

  if (!oppositeArray) {
    if (whereOne) {
      throw new TypeError('Needless whereOne arg!');
    }

    if (thing[oppositeName]) {
      id = thing[oppositeName];
    }
  } else if (whereOne) {
    const Thing = await createThing(mongooseConn, thingConfig, enums);

    const thing2 = await Thing.findOne(whereOne, { _id: 1, [fieldName]: 1 }, { lean: true });

    id = thing2._id.toString(); // eslint-disable-line no-underscore-dangle

    if (!thing[oppositeName].includes(id)) {
      throw new TypeError(`Try to copy to unconnected "${name}" thing with id: "${id}"!`); // eslint-disable-line no-underscore-dangle
    }
  }

  if (!id) {
    rawData[fieldName] = array ? [thing._id] : thing._id; // eslint-disable-line no-underscore-dangle
  }

  const data = coerceDataToGql(
    rawData,
    null,
    thingConfig,
    true, // allFields
  );

  if (id) {
    const processingKind = 'update';
    const allowCopy = await checkData(
      { whereOne: { id }, data },
      filter,
      thingConfig,
      processingKind,
      generalConfig,
      serversideConfig,
      context,
    );

    return allowCopy && [{ ...data, id }];
  }

  const processingKind = 'create';
  const allowCopy = await checkData(
    { data },
    filter,
    thingConfig,
    processingKind,
    generalConfig,
    serversideConfig,
    context,
  );

  return allowCopy && [data];
};

export default get;
