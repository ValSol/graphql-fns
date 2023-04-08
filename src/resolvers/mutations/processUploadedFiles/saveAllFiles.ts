import type {FileAttributes, EntityConfig, UploadOptions} from '../../../tsTypes';

import composeFileFieldNameToConfigNameObject from '../composeFileFieldNameToConfigNameObject';

const saveAllFiles = async (
  filesUploaded: Array<any>,
  alreadyCreatedFiles: Array<any>,
  uploadDate: Date,
  options: UploadOptions,
  entityConfig: EntityConfig,
  saveFiles: {
    [fileFieldConfigName: string]: (file: any, hash: string, date: Date) => Promise<FileAttributes>
  },
): Promise<Array<FileAttributes | null>> => {
  const { counts, hashes, targets } = options;
  const nameToConfigNameObject = composeFileFieldNameToConfigNameObject(entityConfig);

  const promises: Array<Promise<null> | Promise<FileAttributes>> = [];
  let index = 0;
  targets.forEach((fieldName, i) => {
    for (let j = index; j < index + counts[i]; j += 1) {
      if (alreadyCreatedFiles[j]) {
        promises.push(Promise.resolve(null));
      } else {
        promises.push(
          saveFiles[nameToConfigNameObject[fieldName].configName](
            filesUploaded[j],
            hashes[j],
            uploadDate,
          ),
        );
      }
    }
    index += counts[i];
  });

  const results: Array<FileAttributes | null> = await Promise.all(promises);
  return results;
};

export default saveAllFiles;
