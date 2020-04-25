// @flow
import type { FileAttributes, ThingConfig, UploadOptions } from '../../../flowTypes';

import composeFileFieldNameToConfigNameObject from './composeFileFieldNameToConfigNameObject';

const composeAllFilesFieldsData = (
  filesAttributes: Array<Object>,
  data?: Object,
  options: UploadOptions,
  thingConfig: ThingConfig,
  composeFileFieldsData: {
    [fileFieldConfigName: string]: (filesAttributes: FileAttributes) => Object,
  },
): Array<Object> => {
  const { counts, targets } = options;
  const nameToConfigNameObject = composeFileFieldNameToConfigNameObject(thingConfig);

  const data2 = data || {};

  const results = [];
  let index = 0;
  targets.forEach((fieldName, i) => {
    const additionalData = nameToConfigNameObject[fieldName].array
      ? data2[fieldName]
      : data2[fieldName] && [data2[fieldName]];
    for (let j = index; j < index + counts[i]; j += 1) {
      const result = composeFileFieldsData[nameToConfigNameObject[fieldName].configName](
        filesAttributes[j],
      );
      const result2 = additionalData ? { ...additionalData[j - index], ...result } : result;
      results.push(result2);
    }
    index += counts[i];
  });

  return results;
};

export default composeAllFilesFieldsData;
