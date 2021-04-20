// @flow

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';

import checkInventory from '../../../utils/checkInventory';
import createFileSchema from '../../../mongooseModels/createFileSchema';
import executeAuthorisation from '../../utils/executeAuthorisation';

type FileItem = {
  createReadStream: Function,
  encoding: string,
  filename: string,
  mimetype: string,
};

type Args = { files: Array<Promise<FileItem>>, hashes: Array<string> };

type Context = { mongooseConn: Object };

const createUploadThingFilesMutationResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): Function | null => {
  const { inventory } = generalConfig;
  const { name } = thingConfig;

  const inventoryChain = ['Mutation', 'uploadThingFiles', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const { composeFileFieldsData, saveFiles } = serversideConfig;
  if (!composeFileFieldsData) {
    throw new TypeError(
      '"composeFileFieldsData" callbacks have to be defined in serversideConfig!',
    );
  }
  if (!saveFiles) {
    throw new TypeError('"saveFiles" callbacks have to be defined in serversideConfig!');
  }

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

    const { files, hashes } = args;
    const { mongooseConn } = context;

    const fileSchema = createFileSchema(thingConfig);
    const FileModel = mongooseConn.model(`${name}_File`, fileSchema);

    if (files.length !== hashes.length) return null;

    const alreadyUploadedFiles = await FileModel.find(
      { hash: { $in: hashes } },
      {},
      { lean: true },
    );

    const filesDic = alreadyUploadedFiles.reduce(
      (prev, item) => ({ ...prev, [item.hash]: item }),
      {},
    );

    const filesUploaded = await Promise.all(files);

    const uploadDate = new Date();

    const promises = [];
    const usedHashes = [];
    for (let i = 0; i < filesUploaded.length; i += 1) {
      const hash = hashes[i];
      if (!filesDic[hash] && !usedHashes.includes(hash)) {
        promises.push(saveFiles[name](filesUploaded[i], hash, uploadDate));
        usedHashes.push(hash);
      }
    }

    const filesAttributes = await Promise.all(promises);

    const bulkItems = filesAttributes.map((item) => ({ insertOne: { document: item } }));

    const { insertedCount } = await FileModel.bulkWrite(bulkItems);

    if (insertedCount !== usedHashes.length) return null;

    const newlyUploadedFiles = await FileModel.find(
      { hash: { $in: usedHashes } },
      {},
      { lean: true },
    );

    // eslint-disable-next-line no-return-assign, no-param-reassign, no-sequences
    newlyUploadedFiles.reduce((prev, item) => ((prev[item.hash] = item), prev), filesDic);

    return hashes.map((hash) => ({
      ...composeFileFieldsData[name](filesDic[hash]),
      ...filesDic[hash],
      id: filesDic[hash]._id, // eslint-disable-line no-underscore-dangle
    }));
  };

  return resolver;
};

export default createUploadThingFilesMutationResolver;
