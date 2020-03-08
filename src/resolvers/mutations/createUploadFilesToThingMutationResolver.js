// @flow
import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../flowTypes';

import checkInventory from '../../utils/checkInventory';
import executeAuthorisation from '../executeAuthorisation';
import createPushIntoThingMutationResolver from './createPushIntoThingMutationResolver';
import createUpdateThingMutationResolver from './createUpdateThingMutationResolver';
import separateFileFieldsData from './separateFileFieldsData';

type Args = {
  files: Object,
  options: { targets: Array<string>, counts: Array<number> },
  whereOne: Object,
};
type Context = { mongooseConn: Object, pubsub?: Object };

const createUploadFilesToThingMutationResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Function | null => {
  const { inventory } = generalConfig;
  const { name } = thingConfig;
  const { saveOriginalFile, saveDerivativeFiles, composeFileFieldsData } = serversideConfig;
  if (!composeFileFieldsData)
    throw new TypeError('"composeFileFieldsData" callback have to be defined!');
  if (!saveOriginalFile && !saveDerivativeFiles) {
    throw new TypeError(
      'At least one of "saveOriginalFile" or "saveDerivativeFiles" callbacks have to be defined!',
    );
  }

  const inventoryChain = ['Mutation', 'uploadFilesToThing', name];
  if (!checkInventory(inventoryChain, inventory)) return null;

  const updateThingMutationResolver = createUpdateThingMutationResolver(
    thingConfig,
    generalConfig,
    serversideConfig,
  );
  if (!updateThingMutationResolver) return null;

  const pushIntoThingMutationResolver = createPushIntoThingMutationResolver(
    thingConfig,
    generalConfig,
    serversideConfig,
  );
  if (!pushIntoThingMutationResolver) return null;

  const resolver = async (parent: Object, args: Args, context: Context, info: Object): Object => {
    const resolverArgs = { parent, args, context, info };
    await executeAuthorisation({
      inventoryChain,
      resolverArgs,
      serversideConfig,
    });

    const { whereOne, files, options } = args;

    // to get data such as: { logo: { fileId: '', desktop: '/uploaded/cat.png', mobile: '/uploaded/mobile/cat.png'} }

    const fileFieldsData = composeFileFieldsData(files, options, new Date(), thingConfig);
    const { forPush, forUpdate } = separateFileFieldsData(fileFieldsData, options, thingConfig);

    let thing;

    if (Object.keys(forUpdate).length) {
      thing = await updateThingMutationResolver(
        parent,
        { whereOne, data: forUpdate },
        context,
        info,
      );
    }

    if (Object.keys(forPush).length) {
      thing = await pushIntoThingMutationResolver(
        parent,
        { whereOne, data: forPush },
        context,
        info,
      );
    }

    return thing;
  };

  return resolver;
};

export default createUploadFilesToThingMutationResolver;
