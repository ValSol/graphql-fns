// @flow
import type { ThingConfig } from '../../../flowTypes';

type Result = Map<ThingConfig, Array<number>>;

const separateFileFieldsAttributes = (
  options: {
    targets: Array<string>,
    counts: Array<number>,
    hashes: Array<string>,
  },
  thingConfig: ThingConfig,
): Result => {
  const { fileFields } = thingConfig;

  if (!fileFields) throw new TypeError('There are no fileFields for upload!');
  const fieldsObject = fileFields.reduce((prev, attributes) => {
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
      // $FlowFixMe
      item.push(j);
    }
    index += counts[i];
    return prev;
  }, new Map());
};

export default separateFileFieldsAttributes;
