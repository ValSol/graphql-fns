import { Types } from 'mongoose';

import type { EntityConfig, GeneralConfig, GraphqlObject, InvolvedFilter } from '@/tsTypes';

import createMongooseModel from '@/mongooseModels/createMongooseModel';
import checkWhereCompoundOne from '@/resolvers/utils/checkWhereCompoundOne';
import composeWhereInput from '@/resolvers/utils/mergeWhereAndFilter/composeWhereInput';

// mutations that select entities to change by "whereOne" (a single object or an array)
const whereOneActionGeneralNames = new Set([
  'deleteEntity',
  'deleteEntityWithChildren',
  'deleteManyEntities',
  'deleteManyEntitiesWithChildren',
  'updateEntity',
]);

// mutations that can select an existing entity to copy into by "whereTarget"
const whereTargetActionGeneralNames = new Set(['copyEntity', 'copyEntityWithChildren']);

// mutations with array of items where "whereOne" ("whereTarget") is paired with other inputs:
// [itemsKey, compoundItemsKey, whereKey, compoundKey]
const pairedActionGeneralNamesToKeys: Record<string, [string, string, string, string]> = {
  updateManyEntities: [
    'whereOneAndData',
    'whereCompoundOneAndData',
    'whereOne',
    'whereCompoundOne',
  ],
  copyManyEntities: [
    'sourceAndTargetAndData',
    'sourceAndCompoundTargetAndData',
    'whereTarget',
    'whereCompoundTarget',
  ],
  copyManyEntitiesWithChildren: [
    'sourceAndTarget',
    'sourceAndCompoundTarget',
    'whereTarget',
    'whereCompoundTarget',
  ],
};

const isSet = (value: unknown) => value !== undefined && value !== null;

// returns "where" with "id" of the found entity for every "whereCompound" item (keeping the order);...
// ... if an entity is not found, a new (so absent) "id" is used to get the same result as for absent...
// ... "whereOne" ("whereTarget" requires the entity to be found)
const findWhereItems = async (
  items: InvolvedFilter[],
  whereKey: string,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  mongooseConn: any,
  session: any,
): Promise<Array<{ id: Types.ObjectId }>> => {
  items.forEach((item) => {
    checkWhereCompoundOne(item, entityConfig);
  });

  const Entity = await createMongooseModel(mongooseConn, entityConfig, generalConfig.enums);

  const whereItems: Array<{ id: Types.ObjectId }> = [];

  // every entity is selected separately to keep the order of items
  for (let i = 0; i < items.length; i += 1) {
    const { where: conditions } = composeWhereInput(items[i], entityConfig);

    const entity = await Entity.findOne(conditions, { _id: 1 }, { lean: true, session });

    if (!entity && whereKey === 'whereTarget') {
      throw new TypeError(
        `Not found "${entityConfig.name}" entity to copy to: ${JSON.stringify(items[i])}!`,
      );
    }

    whereItems.push({ id: entity ? entity._id : new Types.ObjectId() });
  }

  return whereItems;
};

// replaces "whereCompoundOne" (or "whereCompoundTarget") by "whereOne" (or "whereTarget") with "id"
// of the found entity, so all the rest of the mutation works as if "whereOne" ("whereTarget") was got;
// for paired items (e.g. "whereCompoundOneAndData") the whole arg is replaced by its non-compound...
// ... counterpart (e.g. "whereOneAndData") with the same other inputs of every item
const normalizeWhereCompoundOne = async (
  actionGeneralName: string,
  args: GraphqlObject,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  mongooseConn: any,
  session: any,
): Promise<GraphqlObject> => {
  if (pairedActionGeneralNamesToKeys[actionGeneralName]) {
    const [itemsKey, compoundItemsKey, whereKey, compoundKey] =
      pairedActionGeneralNamesToKeys[actionGeneralName];

    const { [itemsKey]: items, [compoundItemsKey]: compoundItems, ...restArgs } = args;

    if (isSet(items) && isSet(compoundItems)) {
      throw new TypeError(
        `Expected exactly one input from "${itemsKey}" && "${compoundItemsKey}"!`,
      );
    }

    if (!isSet(compoundItems)) {
      if (!isSet(items)) {
        throw new TypeError(`Expected "${compoundItemsKey}" or "${itemsKey}" input!`);
      }

      return args;
    }

    const whereItems = await findWhereItems(
      (compoundItems as GraphqlObject[]).map(({ [compoundKey]: item }) => item as InvolvedFilter),
      whereKey,
      entityConfig,
      generalConfig,
      mongooseConn,
      session,
    );

    return {
      ...restArgs,
      [itemsKey]: (compoundItems as GraphqlObject[]).map(
        ({ [compoundKey]: omitted, ...rest }, i) => ({ ...rest, [whereKey]: whereItems[i] }),
      ),
    } as GraphqlObject;
  }

  const [whereKey, compoundKey] = whereOneActionGeneralNames.has(actionGeneralName)
    ? ['whereOne', 'whereCompoundOne']
    : whereTargetActionGeneralNames.has(actionGeneralName)
      ? ['whereTarget', 'whereCompoundTarget']
      : [];

  if (!whereKey || !compoundKey) return args;

  const { [whereKey]: where, [compoundKey]: whereCompound, ...restArgs } = args;

  if (isSet(where) && isSet(whereCompound)) {
    throw new TypeError(`Expected exactly one input from "${whereKey}" && "${compoundKey}"!`);
  }

  if (!isSet(whereCompound)) {
    if (!isSet(where) && whereKey === 'whereOne') {
      throw new TypeError(`Expected "${compoundKey}" or "${whereKey}" input!`);
    }

    return args;
  }

  const items = (
    Array.isArray(whereCompound) ? whereCompound : [whereCompound]
  ) as InvolvedFilter[];

  const whereItems = await findWhereItems(
    items,
    whereKey,
    entityConfig,
    generalConfig,
    mongooseConn,
    session,
  );

  return {
    ...restArgs,
    [whereKey]: Array.isArray(whereCompound) ? whereItems : whereItems[0],
  } as GraphqlObject;
};

export default normalizeWhereCompoundOne;
