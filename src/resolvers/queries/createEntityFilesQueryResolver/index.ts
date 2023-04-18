import type {
  Context,
  GeneralConfig,
  InventoryСhain,
  ServersideConfig,
  EntityConfig,
  GraphqlObject,
  SintheticResolverInfo,
  InvolvedFilter,
  GraphqlScalar,
} from '../../../tsTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createMongooseModel from '../../../mongooseModels/createMongooseModel';
import getFilterFromInvolvedFilters from '../../utils/getFilterFromInvolvedFilters';
import mergeWhereAndFilter from '../../utils/mergeWhereAndFilter';
import getLimit from '../utils/getLimit';

type Args = {
  where: {
    id: string;
  };
  pagination?: {
    skip: number;
    first: number;
  };
};

const createEntityFilesQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): any | null => {
  const { inventory } = generalConfig;
  const { name } = entityConfig;

  const inventoryChain: InventoryСhain = ['Query', 'entityFiles', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const { composeFileFieldsData } = serversideConfig;
  if (!composeFileFieldsData) {
    throw new TypeError(
      '"composeFileFieldsData" callbacks have to be defined in serversideConfig!',
    );
  }

  const resolver = async (
    parent: null | GraphqlObject,
    args: Args,
    context: Context,
    info: SintheticResolverInfo,
    involvedFilters: {
      [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
    },
  ): Promise<GraphqlObject | GraphqlObject[] | GraphqlScalar | GraphqlScalar[] | null> => {
    const { filter, limit = Infinity } = getFilterFromInvolvedFilters(involvedFilters);

    if (!filter) return null;

    const { where, pagination } = args;

    const { mongooseConn } = context;

    const FileModel = await createMongooseModel(mongooseConn, entityConfig);

    const nakedName = name.slice('Tangible'.length);

    const { where: conditions } = mergeWhereAndFilter(filter, where, entityConfig);

    const projection: Record<string, any> = {};

    // const filesData = await FileModel.find(conditions, projection, { lean: true });

    let query = FileModel.find(conditions, projection, { lean: true });

    if (pagination) {
      const { skip = 0, first } = pagination;

      query = query.skip(skip);

      const limit2 = getLimit(limit, first);

      if (limit2) {
        query = query.limit(limit2);
      }
    } else if (limit !== Infinity) {
      query = query.limit(limit);
    }

    const filesData = await query.exec();

    return filesData.map((fileData) => ({
      ...composeFileFieldsData[nakedName](fileData),
      ...fileData,
      id: fileData._id, // eslint-disable-line no-underscore-dangle
    }));
  };

  return resolver;
};

export default createEntityFilesQueryResolver;
