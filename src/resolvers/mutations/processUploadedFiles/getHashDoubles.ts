import type {EntityConfig, UploadOptions} from '../../../tsTypes';

import composeFileFieldNameToConfigNameObject from '../composeFileFieldNameToConfigNameObject';

const getHashDoubles = (options: UploadOptions, entityConfig: EntityConfig): Array<number | null> => {
  const { counts, hashes, targets } = options;

  const nameToConfigNameObject = composeFileFieldNameToConfigNameObject(entityConfig);

  const indexes: Record<string, any> = {};
  let index = 0;
  return targets.reduce<Array<any>>((prev, fieldName, i) => {
    const { configName } = nameToConfigNameObject[fieldName];

    for (let j = index; j < index + counts[i]; j += 1) {
      const key = `${configName}-${hashes[j]}`;
      if (indexes[key] === undefined) {
        prev.push(null);
        indexes[key] = j;
      } else {
        prev.push(indexes[key]);
      }
    }
    index += counts[i];

    return prev;
  }, []);
};

export default getHashDoubles;
