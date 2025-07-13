import type { DataObject, EntityConfig, GraphqlObject } from '../../../tsTypes';

const addIdsToEntity = <T extends DataObject | GraphqlObject>(
  data: T,
  entityConfig: EntityConfig,
): T => {
  const { embeddedFields } = entityConfig;

  const { _id: id, ...rest } = data;

  const result = { id, ...rest } as unknown as typeof data;

  if (embeddedFields) {
    embeddedFields.reduce((prev, { name, array, config }) => {
      if (data[name]) {
        if (array) {
          prev[name] = (data[name] as (typeof data)[]).map((item) => addIdsToEntity(item, config));
        } else {
          prev[name] = addIdsToEntity(data[name] as typeof data, config);
        }
      }
      return prev;
    }, result);
  }

  return result;
};

export default addIdsToEntity;
