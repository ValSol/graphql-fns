// @flow
import type {
  GeneralConfig,
  ServersideConfig,
  ThingConfig,
  UploadOptions,
} from '../../../flowTypes';

import checkInventory from '../../../utils/checkInventory';
import createFileSchema from '../../../mongooseModels/createFileSchema';
import executeAuthorisation from '../../executeAuthorisation';
import composeAllFilesFieldsData from './composeAllFilesFieldsData';
import createPushIntoThingMutationResolver from '../createPushIntoThingMutationResolver';
import createUpdateThingMutationResolver from '../createUpdateThingMutationResolver';
import getHashDoubles from './getHashDoubles';
import saveAllFiles from './saveAllFiles';
import separateFileFieldsAttributes from './separateFileFieldsAttributes';
import separateFileFieldsData from './separateFileFieldsData';

type Args = {
  files: Object,
  options: UploadOptions,
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

    const hashDoubles = getHashDoubles(options, thingConfig);

    const promises = [];
    indexesByConfig.forEach((indexes, config) => {
      const { name: name2 } = config;
      const fileSchema = createFileSchema(config);
      const FileModel = mongooseConn.model(`${name2}_File`, fileSchema);
      indexes.forEach((index) => {
        if (hashDoubles[index] === null) {
          const hash = hashes[index];
          promises[index] = FileModel.findOne({ hash }, {});
        } else {
          // if there is double mock already uploaded file
          promises[index] = Promise.resolve({});
        }
      });
    });

    const alreadyUploadedFiles = await Promise.all(promises);

    const uploadDate = new Date();
    const filesAttributes = await saveAllFiles(
      filesUploaded,
      alreadyUploadedFiles,
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
      indexes.forEach((index) => {
        if (alreadyUploadedFiles[index]) {
          promises2[index] = Promise.resolve(alreadyUploadedFiles[index]);
        } else {
          promises2[index] = FileModel.create(filesAttributes[index]);
        }
      });
    });

    // files attributes with _ids
    const filesAttributes2 = (await Promise.all(promises2))
      .map((item, i) => {
        if (hashDoubles[i] !== null) {
          return null;
        }
        if (alreadyUploadedFiles[i]) {
          return item;
        }
        const { _id } = item.toObject();
        return { ...filesAttributes[i], _id };
      })
      .map((item, i, arr) => {
        if (hashDoubles[i] !== null) {
          return arr[hashDoubles[i]];
        }
        return item;
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
