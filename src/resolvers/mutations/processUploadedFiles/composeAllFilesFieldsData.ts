import type {FileAttributes, EntityConfig, UploadOptions} from '../../../tsTypes';

import composeFileFieldNameToConfigNameObject from '../composeFileFieldNameToConfigNameObject';

const composeAllFilesFieldsData = (
  filesAttributes: Array<any>,
  data: any | null | undefined,
  options: UploadOptions,
  entityConfig: EntityConfig,
  composeFileFieldsData: {
    [fileFieldConfigName: string]: (filesAttributes: FileAttributes) => any
  },
): Array<any> => {
  const { counts, targets } = options;
  const nameToConfigNameObject = composeFileFieldNameToConfigNameObject(entityConfig);

  const data2 = data || {};

  const results: Array<any> = [];
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
