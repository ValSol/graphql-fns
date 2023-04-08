import { Connection } from 'mongoose';

import type { ServersideConfig, EntityConfig, UploadOptions } from '../../../tsTypes';

import createFileSchema from '../../../mongooseModels/createFileSchema';
import composeAllFilesFieldsData from './composeAllFilesFieldsData';
import getHashDoubles from './getHashDoubles';
import saveAllFiles from './saveAllFiles';
import separateFileFieldsAttributes from './separateFileFieldsAttributes';
import separateFileFieldsData from './separateFileFieldsData';

type FilesUploaded = Array<{
  createReadStream: any;
  encoding: string;
  filename: string;
  mimetype: string;
}>;

type Args = {
  data: any;
  filesUploaded: FilesUploaded;
  mongooseConn: Connection;
  options: UploadOptions;
  serversideConfig: ServersideConfig;
  entityConfig: EntityConfig;
};

type Result = Promise<{
  forUpdate: {
    [fileFieldName: string]: any;
  };
  forPush: {
    [fileFieldName: string]: Array<any>;
  };
}>;

const processUploadedFiles = async ({
  data,
  filesUploaded,
  mongooseConn,
  options,
  serversideConfig,
  entityConfig,
}: Args): Promise<Result> => {
  const { hashes } = options;
  const { saveFiles, composeFileFieldsData } = serversideConfig;
  if (!saveFiles) {
    throw new TypeError('"saveFiles" callbacks have to be defined in serversideConfig!');
  }
  if (!composeFileFieldsData) {
    throw new TypeError(
      '"composeFileFieldsData" callbacks have to be defined in serversideConfig!',
    );
  }

  const indexesByConfig = separateFileFieldsAttributes(options, entityConfig);

  const hashDoubles = getHashDoubles(options, entityConfig);

  const promises: Array<
    | Promise<{
        ['.toObject']: never;
      }>
    | any
  > = [];
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
    entityConfig,
    saveFiles,
  );

  const promises2: Array<
    | Promise<{
        ['.toObject']: never;
      }>
    | any
  > = [];
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
    data,
    options,
    entityConfig,
    composeFileFieldsData,
  );

  return separateFileFieldsData(fileFieldsData, options, entityConfig);
};

export default processUploadedFiles;
