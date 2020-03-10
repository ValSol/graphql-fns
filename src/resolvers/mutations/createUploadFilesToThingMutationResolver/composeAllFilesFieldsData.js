// @flow
import type { FileAttributes, ThingConfig } from '../../../flowTypes';

import composeFileFieldNameToConfigNameObject from './composeFileFieldNameToConfigNameObject';

const composeAllFilesFieldsData = (
  filesAttributes: Array<Object>,
  uploadDate: Date,
  options: {
    targets: Array<string>,
    counts: Array<number>,
  },
  thingConfig: ThingConfig,
  composeFileFieldsData: {
    [fileFieldConfigName: string]: (filesAttributes: FileAttributes, date: Date) => Object,
  },
): Array<Object> => {
  const { counts, targets } = options;
  const nameToConfigNameObject = composeFileFieldNameToConfigNameObject(thingConfig);

  const results = [];
  let index = 0;
  targets.forEach((fieldName, i) => {
    for (let j = index; j < index + counts[i]; j += 1) {
      const result = composeFileFieldsData[nameToConfigNameObject[fieldName]](
        filesAttributes[j],
        uploadDate,
      );
      results.push(result);
    }
    index += counts[i];
  });

  return results;
};

export default composeAllFilesFieldsData;
