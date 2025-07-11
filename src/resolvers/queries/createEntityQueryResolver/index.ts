import type {
  Context,
  GeneralConfig,
  InventoryChain,
  ServersideConfig,
  EntityConfig,
  GraphqlObject,
  SintheticResolverInfo,
  InvolvedFilter,
  GraphqlScalar,
  TangibleEntityConfig,
} from '../../../tsTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createMongooseModel from '../../../mongooseModels/createMongooseModel';
import addCalculatedFieldsToEntity from '../../utils/addCalculatedFieldsToEntity';
import addIdsToEntity from '../../utils/addIdsToEntity';
import getFilterFromInvolvedFilters from '../../utils/getFilterFromInvolvedFilters';
import getProjectionFromInfo from '../../utils/getProjectionFromInfo';
import mergeWhereAndFilter from '../../utils/mergeWhereAndFilter';
import getAsyncFuncResults from '../../utils/getAsyncFuncResults';

type Args = {
  whereOne?: {
    id: string;
  };
  whereCompoundOne?: Record<string, any>;
};

const createEntityQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
  session?: any,
): any | null => {
  const { enums, inventory } = generalConfig;
  const { name } = entityConfig;

  const inventoryChain: InventoryChain = ['Query', 'entity', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (
    parent: null | GraphqlObject,
    args: Args,
    context: Context,
    info: SintheticResolverInfo,
    involvedFilters: {
      [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
    },
  ): Promise<GraphqlObject | GraphqlObject[] | GraphqlScalar | GraphqlScalar[] | null> => {
    const { filter } = getFilterFromInvolvedFilters(involvedFilters);

    if (!filter) return null;

    const { whereOne, whereCompoundOne } = args;

    const { mongooseConn } = context;

    if (whereCompoundOne && whereOne) {
      throw new TypeError('Expected exactly one input from "whereCompoundOne" && "whereOne"!');
    }

    if (whereOne) {
      const whereOneKeys = Object.keys(whereOne);

      if (whereOneKeys.length !== 1) {
        throw new TypeError('Expected exactly one key in whereOne arg!');
      }
    } else {
      if (!whereCompoundOne) {
        throw new TypeError('Expected "whereCompoundOne" or "whereOne" input!');
      }

      const compoundKeySet = Object.keys(whereCompoundOne).reduce((prev, key) => {
        if (key.endsWith('_exists')) {
          prev.add(key.slice(0, -'_exists'.length));
        } else {
          prev.add(key);
        }

        return prev;
      }, new Set<string>());

      const { uniqueCompoundIndexes } = entityConfig as TangibleEntityConfig;

      const isCorrect = (uniqueCompoundIndexes as string[][]).some((arr) =>
        arr.every((key) => compoundKeySet.has(key)),
      );

      if (!isCorrect) {
        throw new TypeError(
          `Got "whereCompoundOne" keys: ${JSON.stringify(
            whereCompoundOne,
          )} that not fit to "uniqueCompoundIndexes": ${JSON.stringify(uniqueCompoundIndexes)}`,
        );
      }
    }

    const resolverArg = { parent, args, context, info, involvedFilters };

    const projection: { [fieldName: string]: 1 } = getProjectionFromInfo(
      entityConfig as TangibleEntityConfig,
      resolverArg,
    );

    const resolverCreatorArg = {
      entityConfig,
      generalConfig,
      serversideConfig,
      inAnyCase,
    };

    const asyncFuncResults = await getAsyncFuncResults(projection, resolverCreatorArg, resolverArg);

    const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

    const { lookups, where: conditions } = mergeWhereAndFilter(
      filter,
      whereOne || whereCompoundOne,
      entityConfig,
    );

    if (lookups.length > 0) {
      const pipeline = [...lookups];

      if (Object.keys(conditions).length > 0) {
        pipeline.push({ $match: conditions });
      }

      pipeline.push({ $project: projection });

      const [entity] = await (session
        ? Entity.aggregate(pipeline).session(session).exec()
        : Entity.aggregate(pipeline).exec());

      if (!entity) return null;

      const entity2 = addCalculatedFieldsToEntity(
        addIdsToEntity(entity, entityConfig),
        projection,
        asyncFuncResults,
        resolverArg,
        entityConfig as TangibleEntityConfig,
        0, // index
      );
      return entity2;
    }

    const entity = await Entity.findOne(conditions, projection, { lean: true, session });

    if (!entity) return null;

    const entity2 = addCalculatedFieldsToEntity(
      addIdsToEntity(entity, entityConfig),
      projection,
      asyncFuncResults,
      resolverArg,
      entityConfig as TangibleEntityConfig,
      0, // index
    );
    return entity2;
  };

  return resolver;
};

export default createEntityQueryResolver;
