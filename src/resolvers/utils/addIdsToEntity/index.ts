import { EndSessionOptions } from 'mongodb';
import type { DataObject, EntityConfig, GraphqlObject } from '../../../tsTypes';

const addIdsToEntity = <T extends DataObject | GraphqlObject>(
  data: T,
  entityConfig: EntityConfig,
): T => {
  const { embeddedFields, fileFields } = entityConfig;

  const { _id: id, ...rest } = data;

  const result = { id, ...rest } as unknown as typeof data;

  if (embeddedFields) {
    embeddedFields.reduce((prev, { name, array, config }) => {
      if (data[name]) {
        if (array) {
          // eslint-disable-next-line no-param-reassign
          prev[name] = (data[name] as (typeof data)[]).map((item) => addIdsToEntity(item, config));
        } else {
          // eslint-disable-next-line no-param-reassign
          prev[name] = addIdsToEntity(data[name] as typeof data, config);
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
          prev[name] = (data[name] as (typeof data)[]).map((item) => addIdsToEntity(item, config));
        } else {
          // eslint-disable-next-line no-param-reassign
          prev[name] = addIdsToEntity(data[name] as typeof data, config);
        }
      }
      return prev;
    }, result);
  }

  return result;
};

export default addIdsToEntity;
