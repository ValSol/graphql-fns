// @flow
import type { FileAttributes, ThingConfig } from '../../../flowTypes';

import composeFileFieldNameToConfigNameObject from './composeFileFieldNameToConfigNameObject';

const saveAllFiles = async (
  filesUploaded: Array<Object>,
  uploadDate: Date,
  options: {
    targets: Array<string>,
    counts: Array<number>,
  },
  thingConfig: ThingConfig,
  saveFiles: {
    [fileFieldConfigName: string]: (file: Object, date: Date) => Promise<FileAttributes>,
  },
): Promise<Array<FileAttributes>> => {
  const { counts, targets } = options;
  const nameToConfigNameObject = composeFileFieldNameToConfigNameObject(thingConfig);

  const promises = [];
  let index = 0;
  targets.forEach((fieldName, i) => {
    for (let j = index; j < index + counts[i]; j += 1) {
      promises.push(saveFiles[nameToConfigNameObject[fieldName]](filesUploaded[j], uploadDate));
    }
    index += counts[i];
  });

  const results = await Promise.all(promises);
  return results;
};

export default saveAllFiles;
