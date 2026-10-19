import { GraphqlObject, InvolvedFilter, TangibleEntityConfig } from '@/tsTypes';
import type { GetPrevious } from '@/resolvers/tsTypes';

import getInputAndOutputFilters from '@/resolvers/utils/getInputAndOutputFilters';
import findEntities from '@/resolvers/utils/findEntities';
import checkData from '@/resolvers/mutations/checkData';

const getPrevious: GetPrevious = async (
  actionGeneralName,
  resolverCreatorArg,
  resolverArg,
  session,
) => {
  const { entityConfig } = resolverCreatorArg;
  const {
    args,
    resolverOptions: { involvedFilters },
  } = resolverArg;

  const { inputFilter, outputFilter } = getInputAndOutputFilters(involvedFilters);

  if (!inputFilter || !outputFilter) return null;

  // "whereCompoundOneAndData" is already replaced by "whereOneAndData" (see "normalizeWhereCompoundOne")
  const { whereOneAndData } = args as {
    whereOneAndData: Array<{ whereOne: InvolvedFilter; data: GraphqlObject }>;
  };

  if (!whereOneAndData.length) return [];

  const whereOne = whereOneAndData.map(({ whereOne: whereOneItem }) => whereOneItem);
  const data = whereOneAndData.map(({ data: dataItem }) => dataItem);

  whereOne.forEach((item) => {
    if (Object.keys(item).length !== 1) {
      throw new TypeError(`Expected exactly one key in whereOne item: "${JSON.stringify(item)}"!`);
    }
  });

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

  const { duplexFields } = entityConfig as TangibleEntityConfig;
  const duplexFieldsProjection = duplexFields
    ? duplexFields.reduce(
        (prev, { name: name2 }) => {
          prev[name2] = 1;
          return prev;
        },
        { _id: 1 } as Record<string, 1>,
      )
    : {};

  // items may select entities by different keys (e.g. "id" in one item & "email" in other one)
  const previousEntities = await findEntities(
    whereOne,
    inputFilter,
    resolverCreatorArg,
    resolverArg,
    session,
    duplexFieldsProjection,
  );

  if (previousEntities.some((entity) => !entity)) return null;

  // the same entity can't be updated by several items in one call
  const indexesById: Record<string, number> = {};

  previousEntities.forEach((entity, i) => {
    const id = String(entity!._id);

    if (indexesById[id] !== undefined) {
      throw new TypeError(
        `Got the same "${entityConfig.name}" entity in items ${indexesById[id]} & ${i} of "whereOneAndData"!`,
      );
    }

    indexesById[id] = i;
  });

  return previousEntities as GraphqlObject[];
};

export default getPrevious;
