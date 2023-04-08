import type {EntityConfig, UploadOptions} from '../../../tsTypes';

type Result = Map<EntityConfig, Array<number>>;

const separateFileFieldsAttributes = (options: UploadOptions, entityConfig: EntityConfig): Result => {
  const { fileFields } = entityConfig;

  if (!fileFields) throw new TypeError('There are no fileFields for upload!');
  const fieldsObject = fileFields.reduce<Record<string, any>>((prev, attributes) => {
    const { name } = attributes;
    // eslint-disable-next-line no-param-reassign
    prev[name] = attributes;
    return prev;
  }, {});

  const { targets, counts } = options;

  let index = 0;
  return targets.reduce((prev, name, i) => {
    const { config } = fieldsObject[name];
    const item = prev.get(config) || prev.set(config, []).get(config);
    for (let j = index; j < index + counts[i]; j += 1) {
      item.push(j);
    }
    index += counts[i];
    return prev;
  }, new Map());
};

export default separateFileFieldsAttributes;
