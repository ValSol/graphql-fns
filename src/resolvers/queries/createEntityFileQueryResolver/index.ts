import type {
  Context,
  GeneralConfig,
  InventoryСhain,
  ServersideConfig,
  EntityConfig,
  InvolvedFilter,
  SintheticResolverInfo,
  GraphqlObject,
  GraphqlScalar,
} from '../../../tsTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createMongooseModel from '../../../mongooseModels/createMongooseModel';
import getFilterFromInvolvedFilters from '../../utils/getFilterFromInvolvedFilters';
import mergeWhereAndFilter from '../../utils/mergeWhereAndFilter';

type Args = {
  whereOne: {
    id: string;
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

  const inventoryChain: InventoryСhain = ['Query', 'entityFile', name];
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
      [derivativeConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
    },
  ): Promise<GraphqlObject | GraphqlObject[] | GraphqlScalar | GraphqlScalar[] | null> => {
    const { filter } = getFilterFromInvolvedFilters(involvedFilters);

    if (!filter) return null;

    const { whereOne } = args;

    const { mongooseConn } = context;

    const FileModel = await createMongooseModel(mongooseConn, entityConfig);

    const nakedName = name.slice('Tangible'.length);

    const whereOneKeys = Object.keys(whereOne);
    if (whereOneKeys.length !== 1) {
      throw new TypeError('Expected exactly one key in whereOne arg!');
    }
    const { where: conditions } = mergeWhereAndFilter(filter, whereOne, entityConfig);

    const projection: Record<string, any> = {};

    const fileData = await FileModel.findOne(conditions, projection, { lean: true });

    if (!fileData) return null;

    const fileFields = composeFileFieldsData[nakedName](fileData);

    return { ...fileFields, ...fileData, id: fileData._id }; // eslint-disable-line no-underscore-dangle
  };

  return resolver;
};

export default createEntityFilesQueryResolver;
