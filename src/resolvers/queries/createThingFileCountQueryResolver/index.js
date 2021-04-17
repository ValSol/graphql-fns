// @flow

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';

import checkInventory from '../../../utils/checkInventory';
import createFileSchema from '../../../mongooseModels/createFileSchema';
import executeAuthorisation from '../../utils/executeAuthorisation';
import mergeWhereAndFilter from '../../utils/mergeWhereAndFilter';

type Args = { where: { id: string } };
type Context = { mongooseConn: Object };

const createThingFileCountQueryResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): Function | null => {
  const { inventory } = generalConfig;
  const { name } = thingConfig;

  const inventoryChain = ['Query', 'thingFileCount', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (
    parent: Object,
    args: Args,
    context: Context,
    info: Object,
    parentFilter: Array<Object>,
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

    const result = await FileModel.countDocuments(conditions);

    return result;
  };

  return resolver;
};

export default createThingFileCountQueryResolver;
