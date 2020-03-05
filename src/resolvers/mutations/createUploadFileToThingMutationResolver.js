// @flow
import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../flowTypes';

import checkInventory from '../../utils/checkInventory';
import executeAuthorisation from '../executeAuthorisation';
import createConcatenateThingMutationResolver from './createConcatenateThingMutationResolver';
import createUpdateThingMutationResolver from './createUpdateThingMutationResolver';

type Args = { file: Object, options: { target: string }, whereOne: Object };
type Context = { mongooseConn: Object, pubsub?: Object };

const createUploadFileToThingMutationResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Function | null => {
  const { inventory } = generalConfig;
  const { name } = thingConfig;
  const { saveFiles } = serversideConfig;
  if (!saveFiles) throw new TypeError('"saveFiles" callback have to be defined!');
  const inventoryChain = ['Mutation', 'uploadFileToThing', name];
  if (!checkInventory(inventoryChain, inventory)) return null;

  const updateThingMutationResolver = createUpdateThingMutationResolver(
    thingConfig,
    generalConfig,
    serversideConfig,
  );
  if (!updateThingMutationResolver) return null;

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

    const {
      whereOne,
      options: { target },
    } = args;

    const { fileFields } = thingConfig;

    const targetFieldObject = fileFields && fileFields.find(({ name: name2 }) => name2 === target);

    if (!targetFieldObject) {
      throw new TypeError(`Invalid target option "${target}" for upload file(s)`);
    }

    const isArray = targetFieldObject.array;

    // to get data such as: { logo: { fileId: '', desktop: '/uploaded/cat.png', mobile: '/uploaded/mobile/cat.png'} }
    const data: { [fieldName: string]: any } = await saveFiles({
      inventoryChain,
      resolverArgs,
      serversideConfig,
    });

    const thing = isArray
      ? await concatenateThingMutationResolver(parent, { whereOne, data }, context, info)
      : await updateThingMutationResolver(parent, { whereOne, data }, context, info);

    return thing;
  };

  return resolver;
};

export default createUploadFileToThingMutationResolver;