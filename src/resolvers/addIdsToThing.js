// @flow
import type { ThingConfig } from '../flowTypes';

const addFilter = (data: Object, thingConfig: ThingConfig): Object => {
  const { embeddedFields, fileFields } = thingConfig;

  const { _id: id, ...rest } = data;

  const result = { id, ...rest };

  if (embeddedFields) {
    embeddedFields.reduce((prev, { name, array, config }) => {
      if (data[name]) {
        if (array) {
          // eslint-disable-next-line no-param-reassign
          prev[name] = data[name].map((item) => addFilter(item, config));
        } else {
          // eslint-disable-next-line no-param-reassign
          prev[name] = addFilter(data[name], config);
        }
      }
      return prev;
    }, result);
  }

  if (fileFields) {
    fileFields.reduce((prev, { name, array, config }) => {
      if (data[name]) {
        if (array) {
          // eslint-disable-next-line no-param-reassign
          prev[name] = data[name].map((item) => addFilter(item, config));
        } else {
          // eslint-disable-next-line no-param-reassign
          prev[name] = addFilter(data[name], config);
        }
      }
      return prev;
    }, result);
  }

  return result;
};

export default addFilter;
