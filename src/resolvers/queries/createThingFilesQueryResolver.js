// @flow

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../flowTypes';

import checkInventory from '../../utils/checkInventory';
import createFileSchema from '../../mongooseModels/createFileSchema';
import executeAuthorisation from '../executeAuthorisation';
import mergeWhereAndFilter from '../mergeWhereAndFilter';

type Args = { where: { id: string } };
type Context = { mongooseConn: Object };

const createThingFilesQueryResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): Function | null => {
  const { inventory } = generalConfig;
  const { name } = thingConfig;

  const inventoryChain = ['Query', 'thingFiles', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const { composeFileFieldsData } = serversideConfig;
  if (!composeFileFieldsData) {
    throw new TypeError(
      '"composeFileFieldsData" callbacks have to be defined in serversideConfig!',
    );
  }

  const resolver = async (
    parent: Object,
    args: Args,
    context: Context,
    info: Object,
    parentFilter: Object,
  ): Object => {
    const filter = inAnyCase
      ? parentFilter
      : await executeAuthorisation(inventoryChain, context, serversideConfig);
    if (!filter) return null;

    const { where } = args;

    const { mongooseConn } = context;

    const fileSchema = createFileSchema(thingConfig);
    const FileModel = mongooseConn.model(`${name}_File`, fileSchema);

    const { where: conditions } = mergeWhereAndFilter(filter, where, thingConfig);

    const projection = {};

    const filesData = await FileModel.find(conditions, projection, { lean: true });

    return filesData.map((fileData) => ({
      ...composeFileFieldsData[name](fileData),
      ...fileData,
      id: fileData._id, // eslint-disable-line no-underscore-dangle
    }));
  };

  return resolver;
};

export default createThingFilesQueryResolver;
