// @flow
import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../flowTypes';

import checkInventory from '../../utils/checkInventory';
import executeAuthorisation from '../executeAuthorisation';
import createConcatenateThingMutationResolver from './createConcatenateThingMutationResolver';

type Args = { file: Object, options: { target: string }, whereOne: Object };
type Context = { mongooseConn: Object, pubsub?: Object };

const createUploadManyFilesToThingMutationResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Function | null => {
  const { inventory } = generalConfig;
  const { name } = thingConfig;
  const { saveFiles } = serversideConfig;
  if (!saveFiles) throw new TypeError('"saveFiles" callback have to be defined!');
  const inventoryChain = ['Mutation', 'uploadManyFilesToThing', name];
  if (!checkInventory(inventoryChain, inventory)) return null;

  const concatenateThingMutationResolver = createConcatenateThingMutationResolver(
    thingConfig,
    generalConfig,
    serversideConfig,
  );
  if (!concatenateThingMutationResolver) return null;

  const resolver = async (parent: Object, args: Args, context: Context, info: Object): Object => {
    const resolverArgs = { parent, args, context, info };
    await executeAuthorisation({
      inventoryChain,
      resolverArgs,
      serversideConfig,
    });

    const { whereOne } = args;

    // to get data such as: { pictures: [{ fileId: '', desktop: '/uploaded/pic1.png', mobile: '/uploaded/mobile/pic1.png'}] }
    const data: { [fieldName: string]: any } = await saveFiles({
      inventoryChain,
      resolverArgs,
      serversideConfig,
    });

    const thing = await concatenateThingMutationResolver(parent, { whereOne, data }, context, info);

    return thing;
  };

  return resolver;
};

export default createUploadManyFilesToThingMutationResolver;
