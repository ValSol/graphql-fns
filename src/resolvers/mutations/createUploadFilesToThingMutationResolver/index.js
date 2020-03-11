// @flow
import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';

import checkInventory from '../../../utils/checkInventory';
import createFileSchema from '../../../mongooseModels/createFileSchema';
import executeAuthorisation from '../../executeAuthorisation';
import composeAllFilesFieldsData from './composeAllFilesFieldsData';
import createPushIntoThingMutationResolver from '../createPushIntoThingMutationResolver';
import createUpdateThingMutationResolver from '../createUpdateThingMutationResolver';
import saveAllFiles from './saveAllFiles';
import separateFileFieldsAttributes from './separateFileFieldsAttributes';
import separateFileFieldsData from './separateFileFieldsData';

type Args = {
  files: Object,
  options: {
    targets: Array<string>,
    counts: Array<number>,
    hashes: Array<string>,
  },
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
  const { saveFiles, composeFileFieldsData } = serversideConfig;

  if (!composeFileFieldsData) {
    throw new TypeError(
      '"composeFileFieldsData" callbacks have to be defined in serversideConfig!',
    );
  }

  if (!saveFiles) {
    throw new TypeError('"saveFiles" callbacks have to be defined in serversideConfig!');
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

    const {
      whereOne,
      files,
      options,
      options: { hashes },
    } = args;
    const { mongooseConn } = context;

    const filesUploaded = await Promise.all(files);

    const indexesByConfig = separateFileFieldsAttributes(options, thingConfig);

    const promises = [];
    indexesByConfig.forEach((indexes, config) => {
      const { name: name2 } = config;
      const fileSchema = createFileSchema(config);
      const FileModel = mongooseConn.model(`${name2}_File`, fileSchema);
      indexes.forEach(index => {
        const hash = hashes[index];
        promises[index] = FileModel.findOne({ hash }, {});
      });
    });

    const alreadyCreatedFiles = await Promise.all(promises);

    const uploadDate = new Date();
    const filesAttributes = await saveAllFiles(
      filesUploaded,
      alreadyCreatedFiles,
      uploadDate,
      options,
      thingConfig,
      saveFiles,
    );

    const promises2 = [];
    indexesByConfig.forEach((indexes, config) => {
      const { name: name2 } = config;
      const fileSchema = createFileSchema(config);
      const FileModel = mongooseConn.model(`${name2}_File`, fileSchema);
      indexes.forEach(index => {
        promises2[index] = alreadyCreatedFiles[index]
          ? Promise.resolve(alreadyCreatedFiles[index])
          : FileModel.create(filesAttributes[index]);
      });
    });

    // files attributes with _ids
    const filesAttributes2 = (await Promise.all(promises2)).map((item, i) => {
      if (alreadyCreatedFiles[i]) {
        return item;
      }
      const { _id } = item.toObject();
      return { ...filesAttributes[i], _id };
    });

    const fileFieldsData = composeAllFilesFieldsData(
      filesAttributes2,
      uploadDate,
      options,
      thingConfig,
      composeFileFieldsData,
    );

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
