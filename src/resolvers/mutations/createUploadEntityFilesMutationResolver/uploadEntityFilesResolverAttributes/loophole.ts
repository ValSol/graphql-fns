import type { FileAttributes, GraphqlObject } from '../../../../tsTypes';
import type { Loophole } from '../../../tsTypes';

import createMongooseModel from '../../../../mongooseModels/createMongooseModel';
import getFilterFromInvolvedFilters from '../../../utils/getFilterFromInvolvedFilters';

const loophole: Loophole = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { entityConfig, serversideConfig } = resolverCreatorArg;
  const { args, context, involvedFilters } = resolverArg;
  const { name } = entityConfig;

  const { filter } = getFilterFromInvolvedFilters(involvedFilters);

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

  const { files, hashes } = args as { files: GraphqlObject[]; hashes: string[] };
  const { mongooseConn } = context;

  const FileModel = await createMongooseModel(mongooseConn, entityConfig);

  const nakedName = name.slice('Tangible'.length);

  if (files.length !== hashes.length) return null;

  const alreadyUploadedFiles = await FileModel.find({ hash: { $in: hashes } }, {}, { lean: true });

  const filesDic = alreadyUploadedFiles.reduce(
    (prev, item) => ({ ...prev, [item.hash]: item }),
    {},
  );

  const filesUploaded = await Promise.all(files);

  const uploadDate = new Date();

  const promises: Array<Promise<FileAttributes>> = [];
  const usedHashes: Array<any> = [];
  for (let i = 0; i < filesUploaded.length; i += 1) {
    const hash = hashes[i];
    if (!filesDic[hash] && !usedHashes.includes(hash)) {
      promises.push(saveFiles[nakedName](filesUploaded[i], hash, uploadDate));
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
    ...composeFileFieldsData[nakedName](filesDic[hash]),
    ...filesDic[hash],
    id: filesDic[hash]._id, // eslint-disable-line no-underscore-dangle
  }));
};

export default loophole;
