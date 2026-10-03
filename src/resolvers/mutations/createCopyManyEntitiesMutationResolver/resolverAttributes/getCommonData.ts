import type { InvolvedFilter, ResolverArg, ResolverCreatorArg } from '../../../../tsTypes';

import createMongooseModel from '../../../../mongooseModels/createMongooseModel';
import getMatchingFields from '../../../../utils/getMatchingFields';
import getOppositeFields from '../../../../utils/getOppositeFields';
import fromMongoToGqlDataArg from '../../../types/fromMongoToGqlDataArg';
import getInputAndOutputFilters from '../../../utils/getInputAndOutputFilters';
import mergeWhereAndFilter from '../../../utils/mergeWhereAndFilter';
import composeWhereInput from '../../../utils/mergeWhereAndFilter/composeWhereInput';
import checkData from '../../checkData';
import unpairSourceAndTarget from './unpairSourceAndTarget';
import { GraphqlObject } from '../../../../tsTypes';

const getCommonManyData = async (
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
  session: any,
  involvedFilters?: {
    [representationConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
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

  const { options } = args as { options?: Record<string, GraphqlObject> };

  const unpaired = unpairSourceAndTarget(args);

  if (!unpaired) {
    throw new TypeError('Expected "sourceAndTarget…" input!');
  }

  const { whereKeyToSource, whereTarget, data: additionalData } = unpaired;

  whereKeyToSource.forEach((item) => {
    const whereKeyToSourceKeys = Object.keys(item);
    if (whereKeyToSourceKeys.length !== 1) {
      throw new TypeError('Expected exactly one key in whereKeyToSource item!');
    }
  });

  if (whereKeyToSource.length === 0) return [];

  const { mongooseConn } = context;

  const [fieldName] = Object.keys(whereKeyToSource[0]);

  const incorrectWhereKeyToSourceItem = whereKeyToSource.find((item) => !item[fieldName]);
  if (incorrectWhereKeyToSourceItem) {
    throw new TypeError(
      `Incorrect key in whereKeyToSource item: "${JSON.stringify(
        incorrectWhereKeyToSourceItem,
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
        `Expected "options key" to be equal to "whereKeyToSource key": "${fieldName}", but it is "${optionsKeys[0]}"!`,
      );
    }

    if (options[fieldName].fieldsToCopy) {
      optionFields = options[fieldName].fieldsToCopy;
    } else {
      forbiddenFields = options[fieldName].fieldsForbiddenToCopy as string[];
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

  // every entity is selected separately to keep the order of "whereKeyToSource" items...
  // ... (entities are matched with "data" & "whereTarget" of the same items by index)
  const entities: Array<any> = [];

  for (let i = 0; i < whereKeyToSource.length; i += 1) {
    const { where } = composeWhereInput(whereKeyToSource[i][fieldName] as InvolvedFilter, config);

    const entity = await CopiedEntity.findOne(where, matchingFieldsProjection, {
      lean: true,
      session,
    });

    if (!entity) return null;

    entities.push(entity);
  }

  let ids = null;

  let entities2: null | Array<any> = null;

  if (!oppositeArray) {
    if (whereTarget) {
      throw new TypeError('Needless whereTarget!');
    }

    const entitiesWithOppositeName = entities.filter((entity) => entity[oppositeName]);

    if (entitiesWithOppositeName.length && entitiesWithOppositeName.length !== entities.length) {
      throw new TypeError(`Inconsistent link with copiedFrom & copiedTo entities!`);
    }

    if (entitiesWithOppositeName.length) {
      ids = entities.map((entity) => entity[oppositeName].toString());

      const foundEntities2 = await Entity.find({ _id: { $in: ids } }, matchingFieldsProjection, {
        lean: true,
        session,
      });

      // restore the order of "ids" (mongodb doesn't keep the order of "$in" items)
      const entities2ById = foundEntities2.reduce((prev, entity2) => {
        prev[entity2._id.toString()] = entity2;
        return prev;
      }, {});

      entities2 = ids.map((id) => entities2ById[id]);
    }
  } else if (whereTarget) {
    // every entity is selected separately to keep the order of "whereTarget" items
    entities2 = [];

    for (let i = 0; i < whereTarget.length; i += 1) {
      const { where: where2 } = mergeWhereAndFilter(inputFilter, whereTarget[i], entityConfig);

      const entity2 = await Entity.findOne(where2, matchingFieldsProjection, {
        lean: true,
        session,
      });

      if (!entity2) {
        throw new TypeError(
          `Not found "${name}" entity to copy to: ${JSON.stringify(whereTarget[i])}!`,
        );
      }

      entities2.push(entity2);
    }

    ids = entities2.map((entity2) => entity2._id.toString());

    entities.forEach((entity, i) => {
      if (!ids) {
        // to prevent flowjs error
        throw new TypeError('Got "ids" that null!');
      }
      if (!entity[oppositeName].map((id2) => id2.toString()).includes(ids[i])) {
        throw new TypeError(`Try to copy to unconnected "${name}" entity with id: "${ids[i]}"!`);
      }
    });
  }

  const { rawData, rawData2 } = entities.reduce(
    (prev, entity, i) => {
      const item = matchingFields.reduce(
        (prev2, matchingField) => {
          prev2.rawData[matchingField] =
            entity[matchingField] === undefined ? null : entity[matchingField];

          if (entities2) {
            const entity2 = entities2[i];

            prev2.rawData2[matchingField] =
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
      item[fieldName] = array ? [entities[i]._id] : entities[i]._id;
    });
  }

  let allowCopy = true;
  const result: Array<any> = [];

  for (let i = 0; i < rawData.length; i += 1) {
    const data = { ...fromMongoToGqlDataArg(rawData[i], entityConfig), ...additionalData[i] };

    if (ids) {
      if (!entities2[i]) {
        throw new TypeError(
          `In the "${config.name}" entity with id: "${entities[i]._id}" got dead ref: "${oppositeName}"="${ids[i]}"!`,
        );
      }

      const processingKind = 'update';
      const id = ids[i];

      allowCopy =
        allowCopy &&
        (involvedFilters
          ? await checkData(
              resolverCreatorArg,
              { ...resolverArg, args: { whereOne: { id }, data } },
              outputFilter,
              processingKind,
              session,
            )
          : true);

      result.push({ ...rawData2[i], _id: id });
      result.push(rawData[i]);
    } else {
      const processingKind = 'create';

      allowCopy =
        allowCopy &&
        (involvedFilters
          ? await checkData(
              resolverCreatorArg,
              { ...resolverArg, args: { data } },
              outputFilter,
              processingKind,
              session,
            )
          : true);

      result.push(rawData[i]);
    }
  }

  return allowCopy && result;
};

export default getCommonManyData;
