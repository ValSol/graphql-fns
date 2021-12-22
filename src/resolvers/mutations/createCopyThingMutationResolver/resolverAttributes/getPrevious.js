// @flow

import type { GetPrevious } from '../../../flowTypes';

import createThing from '../../../../mongooseModels/createThing';
import getMatchingFields from '../../../../utils/getMatchingFields';
import getOppositeFields from '../../../../utils/getOppositeFields';
import coerceDataToGql from '../../../../utils/coerceDataToGql';
import executeAuthorisation from '../../../utils/executeAuthorisation';
import composeWhereInput from '../../../utils/mergeWhereAndFilter/composeWhereInput';
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

  const { whereOnes, whereOne, options } = args;
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
    throw new TypeError(
      `Not found appropriate duplex field: "${fieldName}" in thing: "${thingConfig.name}"!`,
    );
  }

  let optionFields = null;

  if (options) {
    const optionsKeys = Object.keys(options);
    if (optionsKeys.length !== 1) {
      throw new TypeError(
        `Expected exactly one key in options arg!, but have: ${optionsKeys.length}!`,
      );
    }

    if (optionsKeys[0] !== fieldName) {
      throw new TypeError(
        `Expected "options key" to be equal to "whereOnes key": "${fieldName}", but it is "${optionsKeys[0]}"!`,
      );
    }

    optionFields = options[fieldName].fieldsToCopy;
  }

  const [{ array, config, oppositeName }, { array: oppositeArray }] = fieldsPair;

  const matchingFields = getMatchingFields(thingConfig, config).filter((matchingField) => {
    if (matchingField === fieldName) return false;

    return optionFields ? optionFields.includes(matchingField) : true;
  });

  if (!matchingFields.length) {
    throw TypeError(
      `Expected at least one matching field in "${name}" and "${config.name}" things!`,
    );
  }

  const matchingFieldsProjection = matchingFields.reduce(
    (prev, matchingField) => {
      prev[matchingField] = 1; // eslint-disable-line no-param-reassign
      return prev;
    },
    { _id: 1, [oppositeName]: 1 },
  );

  const CopiedThing = await createThing(mongooseConn, config, enums);
  const Thing = await createThing(mongooseConn, thingConfig, enums);

  const { where } = composeWhereInput(whereOnes[fieldName], config);
  const thing = await CopiedThing.findOne(where, matchingFieldsProjection, { lean: true });

  if (!thing) return null;

  let id = null;

  let thing2 = null;

  if (!oppositeArray) {
    if (whereOne) {
      throw new TypeError('Needless whereOne arg!');
    }

    if (thing[oppositeName]) {
      id = thing[oppositeName].toString();

      thing2 = await Thing.findOne({ _id: thing[oppositeName] }, matchingFieldsProjection, {
        lean: true,
      });
    }
  } else if (whereOne) {
    const { where: where2 } = composeWhereInput(whereOne, thingConfig);
    thing2 = await Thing.findOne(where2, matchingFieldsProjection, { lean: true });

    id = thing2._id.toString(); // eslint-disable-line no-underscore-dangle

    if (!thing[oppositeName].map((id2) => id2.toString()).includes(id)) {
      throw new TypeError(`Try to copy to unconnected "${name}" thing with id: "${id}"!`); // eslint-disable-line no-underscore-dangle
    }
  }

  const { rawData, rawData2 } = matchingFields.reduce(
    (prev, matchingField) => {
      prev.rawData[matchingField] = // eslint-disable-line no-param-reassign
        thing[matchingField] === undefined ? null : thing[matchingField];

      if (thing2) {
        prev.rawData2[matchingField] = // eslint-disable-line no-param-reassign
          thing2[matchingField] === undefined ? null : thing2[matchingField];
      }
      return prev;
    },
    { rawData: {}, rawData2: {} },
  );

  if (!id) {
    rawData[fieldName] = array ? [thing._id] : thing._id; // eslint-disable-line no-underscore-dangle
  }

  const data = coerceDataToGql(rawData, null, thingConfig);

  if (id) {
    const data2 = coerceDataToGql(rawData2, null, thingConfig);

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

    return allowCopy && [{ ...data2, id }, data];
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
