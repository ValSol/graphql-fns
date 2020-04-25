// @flow
import type { FileAttributes, ThingConfig, UploadOptions } from '../../../flowTypes';

import composeFileFieldNameToConfigNameObject from './composeFileFieldNameToConfigNameObject';

const saveAllFiles = async (
  filesUploaded: Array<Object>,
  alreadyCreatedFiles: Array<Object>,
  uploadDate: Date,
  options: UploadOptions,
  thingConfig: ThingConfig,
  saveFiles: {
    [fileFieldConfigName: string]: (
      file: Object,
      hash: string,
      date: Date,
    ) => Promise<FileAttributes>,
  },
): Promise<Array<FileAttributes | null>> => {
  const { counts, hashes, targets } = options;
  const nameToConfigNameObject = composeFileFieldNameToConfigNameObject(thingConfig);

  const promises = [];
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

  // $FlowFixMe
  const results: Array<FileAttributes | null> = await Promise.all(promises);
  return results;
};

export default saveAllFiles;
