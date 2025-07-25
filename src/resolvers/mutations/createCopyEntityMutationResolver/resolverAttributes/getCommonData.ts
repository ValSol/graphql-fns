import type {
  TangibleEntityConfig,
  InvolvedFilter,
  ResolverArg,
  ResolverCreatorArg,
} from '../../../../tsTypes';

import createMongooseModel from '../../../../mongooseModels/createMongooseModel';
import getMatchingFields from '../../../../utils/getMatchingFields';
import getOppositeFields from '../../../../utils/getOppositeFields';
import fromMongoToGqlDataArg from '../../../types/fromMongoToGqlDataArg';
import getInputAndOutputFilters from '../../../utils/getInputAndOutputFilters';
import mergeWhereAndFilter from '../../../utils/mergeWhereAndFilter';
import composeWhereInput from '../../../utils/mergeWhereAndFilter/composeWhereInput';
import checkData from '../../checkData';

const getCommonData = async (
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
  session: any,
  involvedFilters?: {
    [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
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

  const { whereOnes, whereOne, options, data: additionalData = {} } = args;
  const whereOnesKeys = Object.keys(whereOnes);

  if (whereOnesKeys.length !== 1) {
    throw new TypeError(
      `Expected exactly one key in whereOnes arg!, but have: ${
        whereOnesKeys.length
      } (${JSON.stringify(whereOnesKeys)})!`,
    );
  }

  const { mongooseConn } = context;

  const [fieldName] = whereOnesKeys;

  const fieldsPair = getOppositeFields(entityConfig as TangibleEntityConfig).find(
    ([{ name: name2 }]) => name2 === fieldName,
  );

  if (!fieldsPair) {
    throw new TypeError(
      `Not found appropriate duplex field: "${fieldName}" in entity: "${entityConfig.name}"!`,
    );
  }

  let optionFields = null;

  let forbiddenFields: string[] = [];

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

    if (options[fieldName].fieldsToCopy && options[fieldName].fieldsForbiddenToCopy) {
      throw new TypeError(
        `Got simultaniusly "fieldsToCopy" & "fieldsForbiddenToCopy" for "${fieldName}" fieldName "${entityConfig.name}" entity copy options!`,
      );
    }

    if (options[fieldName].fieldsToCopy) {
      optionFields = options[fieldName].fieldsToCopy;
    } else {
      forbiddenFields = options[fieldName].fieldsForbiddenToCopy;
    }
  }

  const [{ array, config, oppositeName }, { array: oppositeArray }] = fieldsPair;

  const matchingFields = getMatchingFields(entityConfig, config).filter((matchingField) => {
    if (matchingField === fieldName) return false;

    return optionFields
      ? optionFields.includes(matchingField)
      : !forbiddenFields.includes(matchingField);
  });

  if (matchingFields.length === 0) {
    throw TypeError(
      `Expected at least one matching field in "${name}" and "${config.name}" entities!`,
    );
  }

  const matchingFieldsProjection = matchingFields.reduce(
    (prev, matchingField) => {
      prev[matchingField] = 1;
      return prev;
    },
    { _id: 1, [oppositeName]: 1 },
  );

  const CopiedEntity = await createMongooseModel(mongooseConn, config, enums);
  const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

  const { where } = composeWhereInput(whereOnes[fieldName], config);
  const entity = await CopiedEntity.findOne(where, matchingFieldsProjection, {
    lean: true,
    session,
  });

  if (!entity) return null;

  let id = null;

  let entity2 = null;

  if (!oppositeArray) {
    if (whereOne) {
      throw new TypeError('Needless whereOne arg!');
    }

    if (entity[oppositeName]) {
      id = entity[oppositeName].toString();

      entity2 = await Entity.findOne({ _id: entity[oppositeName] }, matchingFieldsProjection, {
        lean: true,
        session,
      });
    }
  } else if (whereOne) {
    const { where: where2 } = mergeWhereAndFilter(inputFilter, whereOne, entityConfig);
    entity2 = await Entity.findOne(where2, matchingFieldsProjection, { lean: true, session });

    id = entity2._id.toString();

    if (!entity[oppositeName].map((id2) => id2.toString()).includes(id)) {
      throw new TypeError(`Try to copy to unconnected "${name}" entity with id: "${id}"!`);
    }
  }

  const { rawData, rawData2 } = matchingFields.reduce(
    (prev, matchingField) => {
      prev.rawData[matchingField] =
        entity[matchingField] === undefined ? null : entity[matchingField];

      if (entity2) {
        prev.rawData2[matchingField] =
          entity2[matchingField] === undefined ? null : entity2[matchingField];
      }
      return prev;
    },
    { rawData: {}, rawData2: {} },
  );

  if (!id) {
    rawData[fieldName] = array ? [entity._id] : entity._id;
  }

  const data = {
    ...fromMongoToGqlDataArg(rawData, entityConfig),
    ...(additionalData as Record<string, any>),
  };

  if (id) {
    if (!entity2) {
      throw new TypeError(
        `In the "${config.name}" entity with id: "${entity._id}" got dead ref: "${oppositeName}"="${id}"!`,
      );
    }

    const processingKind = 'update';
    const allowCopy = involvedFilters
      ? await checkData(
          resolverCreatorArg,
          { ...resolverArg, args: { whereOne: { id }, data } },
          outputFilter,
          processingKind,
          session,
        )
      : true;

    return allowCopy && [{ ...rawData2, _id: id }, rawData];
  }

  const processingKind = 'create';
  const allowCopy = involvedFilters
    ? await checkData(
        resolverCreatorArg,
        { ...resolverArg, args: { data } },
        outputFilter,
        processingKind,
        session,
      )
    : true;

  return allowCopy && [rawData];
};

export default getCommonData;
