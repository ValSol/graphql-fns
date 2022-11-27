// @flow
import type { FileAttributes, EntityConfig, UploadOptions } from '../../../flowTypes';

import composeFileFieldNameToConfigNameObject from '../composeFileFieldNameToConfigNameObject';

const composeMockFilesData = (
  options: UploadOptions,
  preData: Object,
  files: Array<{
    encoding: string,
    filename: string,
    mimetype: string,
  }>,
  entityConfig: EntityConfig,
  composeFileFieldsData: {
    [fileFieldConfigName: string]: (filesAttributes: FileAttributes) => Object,
  },
  uploadedAt: Date = new Date(),
): Object => {
  const { counts, hashes, targets } = options;
  const nameToConfigNameObject = composeFileFieldNameToConfigNameObject(entityConfig);

  const data = preData || {};

  const results = {};
  let index = 0;
  targets.forEach((fieldName, i) => {
    const { configName, array } = nameToConfigNameObject[fieldName];

    if (array) {
      results[fieldName] = [];
    }

    for (let j = index; j < index + counts[i]; j += 1) {
      const filesAttributes = {
        _id: `${j}`,
        hash: hashes[j],
        filename: files[j].filename,
        mimetype: files[j].mimetype,
        encoding: files[j].encoding,
        uploadedAt,
      };

      const dataItem = data[fieldName] && (array ? data[fieldName][j - index] : data[fieldName]);

      const item = { ...composeFileFieldsData[configName](filesAttributes), ...dataItem };

      if (array) {
        results[fieldName].push(item);
      } else {
        results[fieldName] = item;
      }
    }
    index += counts[i];
  });

  return results;
};

export default composeMockFilesData;
