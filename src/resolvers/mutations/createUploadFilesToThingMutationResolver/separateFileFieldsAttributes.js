// @flow
import type { ThingConfig } from '../../../flowTypes';

type Result = Map<ThingConfig, Array<number>>;

const separateFileFieldsAttributes = (
  options: {
    targets: Array<string>,
    counts: Array<number>,
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

    if (fieldsObject[name].array) {
      const newIndex = index + counts[i];
      for (let j = index; j < newIndex; j += 1) {
        // $FlowFixMe
        item.push(j);
      }
      index = newIndex;
    } else {
      // $FlowFixMe
      item.push(index);
      index += 1;
    }
    return prev;
  }, new Map());
};

export default separateFileFieldsAttributes;
