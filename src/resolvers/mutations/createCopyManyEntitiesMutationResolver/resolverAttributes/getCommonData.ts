import type { InvolvedFilter } from '../../../../tsTypes';
import type { ResolverCreatorArg, ResolverArg } from '../../../tsTypes';

import createMongooseModel from '../../../../mongooseModels/createMongooseModel';
import getMatchingFields from '../../../../utils/getMatchingFields';
import getOppositeFields from '../../../../utils/getOppositeFields';
import fromMongoToGqlDataArg from '../../../types/fromMongoToGqlDataArg';
import getInputAndOutputFilters from '../../../utils/getInputAndOutputFilters';
import mergeWhereAndFilter from '../../../utils/mergeWhereAndFilter';
import composeWhereInput from '../../../utils/mergeWhereAndFilter/composeWhereInput';
import checkData from '../../checkData';
import { GraphqlObject } from '../../../../tsTypes';

const getCommonData = async (
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
  involvedFilters?: {
    [derivativeConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
  },
): Promise<null | Array<any>> => {
  const { inputFilter, outputFilter } = involvedFilters
    ? getInputAndOutputFilters(involvedFilters)
    : { inputFilter: [], outputFilter: [] };

  if (!inputFilter || !outputFilter) return null;

  const { entityConfig, generalConfig, serversideConfig } = resolverCreatorArg;
  const { args, context } = resolverArg;
  const { enums } = generalConfig;
  const { name } = entityConfig;

  const { whereOnes, whereOne, options } = args as {
    whereOnes: GraphqlObject[];
    whereOne?: GraphqlObject[];
    options?: Record<string, GraphqlObject>;
  };

  whereOnes.forEach((item) => {
    const whereOnesKeys = Object.keys(item);
    if (whereOnesKeys.length !== 1) {
      throw new TypeError('Expected exactly one key in where arg!');
    }
  });

  if (!whereOnes.length) return [];

  if (whereOne && whereOne.length !== whereOnes.length) {
    throw new TypeError(
      `wehreOne length: ${whereOne.length} not equal whereOnes length: ${whereOnes.length}!`,
    );
  }

  const { mongooseConn } = context;

  const [fieldName] = Object.keys(whereOnes[0]);

  const incorrectWhreOnesItem = whereOnes.find((item) => !item[fieldName]);
  if (incorrectWhreOnesItem) {
    throw new TypeError(
      `Incorrect key in whereOne item: "${JSON.stringify(
        incorrectWhreOnesItem,
      )}" instead of "${fieldName}"!`,
    );
  }

  const fieldsPair = getOppositeFields(entityConfig).find(
    ([{ name: name2 }]) => name2 === fieldName,
  );

  if (!fieldsPair) {
    throw new TypeError(
      `Not found appropriate duplex field: "${fieldName}" in entity: "${entityConfig.name}"!`,
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

  const matchingFields = getMatchingFields(entityConfig, config).filter((matchingField) => {
    if (matchingField === fieldName) return false;

    return optionFields ? optionFields.includes(matchingField) : true;
  });

  if (!matchingFields.length) {
    throw TypeError(
      `Expected at least one matching field in "${name}" and "${config.name}" entities!`,
    );
  }

  const matchingFieldsProjection = matchingFields.reduce(
    (prev, matchingField) => {
      prev[matchingField] = 1; // eslint-disable-line no-param-reassign
      return prev;
    },
    { _id: 1, [oppositeName]: 1 },
  );

  const CopiedEntity = await createMongooseModel(mongooseConn, config, enums);
  const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

  const arg = { OR: whereOnes.map((item) => item[fieldName]) } as InvolvedFilter;

  const { where } = composeWhereInput(arg, config);
  const entities = await CopiedEntity.find(where, matchingFieldsProjection, { lean: true });

  if (entities.length !== whereOnes.length) return null;

  let ids = null;

  let entities2 = null;

  if (!oppositeArray) {
    if (whereOne) {
      throw new TypeError('Needless whereOne arg!');
    }

    const entitiesWithOppositeName = entities.filter((entity) => entity[oppositeName]);

    if (entitiesWithOppositeName.length && entitiesWithOppositeName.length !== entities.length) {
      throw new TypeError(`Inconsistent link with copiedFrom & copiedTo entities!`);
    }

    if (entitiesWithOppositeName.length) {
      ids = entities.map((entity) => entity[oppositeName].toString());

      entities2 = await Entity.find({ _id: { $in: ids } }, matchingFieldsProjection, {
        lean: true,
      });
    }
  } else if (whereOne) {
    const { where: where2 } = mergeWhereAndFilter(inputFilter, { OR: whereOne }, entityConfig);
    entities2 = await Entity.find(where2, matchingFieldsProjection, { lean: true });

    ids = entities2.map((entity2) => entity2._id.toString()); // eslint-disable-line no-underscore-dangle

    entities.forEach((entity, i) => {
      if (!ids) {
        // to prevent flowjs error
        throw new TypeError('Got "ids" that null!');
      }
      if (!entity[oppositeName].map((id2) => id2.toString()).includes(ids[i])) {
        throw new TypeError(`Try to copy to unconnected "${name}" entity with id: "${ids[i]}"!`); // eslint-disable-line no-underscore-dangle
      }
    });
  }

  const { rawData, rawData2 } = entities.reduce(
    (prev, entity, i) => {
      const item = matchingFields.reduce(
        (prev2, matchingField) => {
          prev2.rawData[matchingField] = // eslint-disable-line no-param-reassign
            entity[matchingField] === undefined ? null : entity[matchingField];

          if (entities2) {
            const entity2 = entities2[i];

            prev2.rawData2[matchingField] = // eslint-disable-line no-param-reassign
              entity2[matchingField] === undefined ? null : entity2[matchingField];
          }
          return prev2;
        },
        { rawData: {}, rawData2: {} },
      );

      prev.rawData.push(item.rawData);
      prev.rawData2.push(item.rawData2);

      return prev;
    },
    { rawData: [], rawData2: [] },
  );

  if (!ids) {
    rawData.forEach((item, i) => {
      item[fieldName] = array ? [entities[i]._id] : entities[i]._id; // eslint-disable-line no-underscore-dangle, no-param-reassign
    });
  }

  let allowCopy = true;
  const result: Array<any> = [];

  for (let i = 0; i < rawData.length; i += 1) {
    const data = fromMongoToGqlDataArg(rawData[i], entityConfig);

    if (ids) {
      const processingKind = 'update';
      const id = ids[i];

      allowCopy =
        allowCopy &&
        (involvedFilters
          ? // eslint-disable-next-line no-await-in-loop
            await checkData(
              { whereOne: { id }, data },
              outputFilter,
              entityConfig,
              processingKind,
              generalConfig,
              serversideConfig,
              context,
            )
          : true);

      result.push({ ...rawData2[i], _id: id });
      result.push(rawData[i]);
    } else {
      const processingKind = 'create';

      allowCopy =
        allowCopy &&
        (involvedFilters
          ? // eslint-disable-next-line no-await-in-loop
            await checkData(
              { data },
              outputFilter,
              entityConfig,
              processingKind,
              generalConfig,
              serversideConfig,
              context,
            )
          : true);

      result.push(rawData[i]);
    }
  }

  return allowCopy && result;
};

export default getCommonData;
