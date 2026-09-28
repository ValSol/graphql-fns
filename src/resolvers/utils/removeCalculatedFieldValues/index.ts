import type { DataObject, EntityConfig, TangibleEntityConfig } from '@/tsTypes';

// values of calculated fields are never taken from the database: a stored property with the name...
// ... of a calculated field (e.g. left by old data) would be taken for a materialized value, so...
// ... it is removed from a fetched record before calculated fields are processed
const removeCalculatedFieldValues = <T extends DataObject>(
  data: T,
  entityConfig: EntityConfig,
): T => {
  const { calculatedFields = [] } = entityConfig as TangibleEntityConfig;

  if (!calculatedFields.some(({ name }) => Object.prototype.hasOwnProperty.call(data, name))) {
    return data;
  }

  const result = { ...data };

  calculatedFields.forEach(({ name }) => {
    delete result[name];
  });

  return result;
};

export default removeCalculatedFieldValues;
