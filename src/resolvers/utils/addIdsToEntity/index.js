// @flow
import type { EntityConfig } from '../../../flowTypes';

const addIdsToEntity = (data: Object, entityConfig: EntityConfig): Object => {
  const { embeddedFields, fileFields } = entityConfig;

  const { _id: id, ...rest } = data;

  const result = { id, ...rest };

  if (embeddedFields) {
    embeddedFields.reduce((prev, { name, array, config }) => {
      if (data[name]) {
        if (array) {
          // eslint-disable-next-line no-param-reassign
          prev[name] = data[name].map((item) => addIdsToEntity(item, config));
        } else {
          // eslint-disable-next-line no-param-reassign
          prev[name] = addIdsToEntity(data[name], config);
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
          prev[name] = data[name].map((item) => addIdsToEntity(item, config));
        } else {
          // eslint-disable-next-line no-param-reassign
          prev[name] = addIdsToEntity(data[name], config);
        }
      }
      return prev;
    }, result);
  }

  return result;
};

export default addIdsToEntity;
