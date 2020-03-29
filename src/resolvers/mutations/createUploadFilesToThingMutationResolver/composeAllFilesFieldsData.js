// @flow
import type { FileAttributes, ThingConfig, UploadOptions } from '../../../flowTypes';

import composeFileFieldNameToConfigNameObject from './composeFileFieldNameToConfigNameObject';

const composeAllFilesFieldsData = (
  filesAttributes: Array<Object>,
  options: UploadOptions,
  thingConfig: ThingConfig,
  composeFileFieldsData: {
    [fileFieldConfigName: string]: (filesAttributes: FileAttributes) => Object,
  },
): Array<Object> => {
  const { counts, targets } = options;
  const nameToConfigNameObject = composeFileFieldNameToConfigNameObject(thingConfig);

  const results = [];
  let index = 0;
  targets.forEach((fieldName, i) => {
    for (let j = index; j < index + counts[i]; j += 1) {
      const result = composeFileFieldsData[nameToConfigNameObject[fieldName]](filesAttributes[j]);
      results.push(result);
    }
    index += counts[i];
  });

  return results;
};

export default composeAllFilesFieldsData;
