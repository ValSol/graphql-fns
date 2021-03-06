// @flow
import type { GetPrevious } from '../../../flowTypes';

import createFileSchema from '../../../../mongooseModels/createFileSchema';
import executeAuthorisation from '../../../utils/executeAuthorisation';

const getPrevious: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { thingConfig, serversideConfig, inAnyCase } = resolverCreatorArg;
  const { args, context, parentFilter } = resolverArg;
  const { name } = thingConfig;

  const inventoryChain = ['Mutation', actionGeneralName, name];
  if (!inAnyCase && !(await executeAuthorisation(inventoryChain, context, serversideConfig))) {
    return null;
  }

  const filter = inAnyCase
    ? parentFilter
    : // $FlowFixMe
      await executeAuthorisation(inventoryChain, context, serversideConfig);

  if (!filter) return null;

  const { composeFileFieldsData, saveFiles } = serversideConfig;
  if (!composeFileFieldsData) {
    throw new TypeError(
      '"composeFileFieldsData" callbacks have to be defined in serversideConfig!',
    );
  }
  if (!saveFiles) {
    throw new TypeError('"saveFiles" callbacks have to be defined in serversideConfig!');
  }

  const { files, hashes } = args;
  const { mongooseConn } = context;

  const fileSchema = createFileSchema(thingConfig);
  const FileModel = mongooseConn.model(`${name}_File`, fileSchema);

  if (files.length !== hashes.length) return null;

  const alreadyUploadedFiles = await FileModel.find({ hash: { $in: hashes } }, {}, { lean: true });

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

export default getPrevious;
