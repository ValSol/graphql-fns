import type { EntityConfig } from '@/tsTypes';

const isNil = (value: unknown) => value === undefined || value === null;

// value of a field in "data" to create: "{ connect: id }" of relational / duplex field gives "id",...
// ... "create" of a new linked entity gives "undefined" (its id is not known yet)
const getValue = (value: any): any => {
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Array.isArray(value.connect) ? undefined : value.connect;
  }

  return value;
};

// dates (as "Date" or string) are compared by time, other values as strings
const normalize = (value: any, dateTime: boolean): string =>
  dateTime ? `date:${new Date(value).getTime()}` : `value:${String(value)}`;

// names of scalar (not array) fields that have a unique index
const getUniqueFieldNames = (entityConfig: EntityConfig): string[] => {
  const { dateTimeFields = [], floatFields = [], intFields = [], textFields = [] } = entityConfig;

  const fields: Array<{ name: string; unique?: boolean; array?: boolean; parent?: boolean }> = [
    ...textFields,
    ...intFields,
    ...floatFields,
    ...dateTimeFields,
  ];

  if (entityConfig.type === 'tangible') {
    const { duplexFields = [], relationalFields = [] } = entityConfig;

    fields.push(...duplexFields, ...relationalFields);
  }

  return fields
    .filter(({ unique, array, parent }) => unique && !array && !parent)
    .map(({ name }) => name);
};

// keys of unique indexes the entity created with "data" gets: two entities with a common key...
// ... can't be both created (mongo throws duplicate key error), so they are the same entity;...
// ... a compound index key is composed if at least one of its fields is set (absent one is "null")
const composeUniqueKeys = (data: Record<string, any>, entityConfig: EntityConfig): string[] => {
  const keys: string[] = [];

  const { dateTimeFields = [] } = entityConfig;
  const dateTimeFieldNames = new Set(dateTimeFields.map(({ name }) => name));

  getUniqueFieldNames(entityConfig).forEach((fieldName) => {
    const value = getValue(data[fieldName]);

    if (!isNil(value)) {
      keys.push(JSON.stringify([fieldName, normalize(value, dateTimeFieldNames.has(fieldName))]));
    }
  });

  const { uniqueCompoundIndexes = [] } = entityConfig as { uniqueCompoundIndexes?: string[][] };

  uniqueCompoundIndexes.forEach((fieldNames) => {
    const values = fieldNames.map((fieldName) => getValue(data[fieldName]));

    // "create" of a linked entity: the key is not known
    if (fieldNames.some((fieldName, k) => !isNil(data[fieldName]) && isNil(values[k]))) return;

    if (values.every(isNil)) return;

    keys.push(
      JSON.stringify([
        fieldNames,
        values.map((value, k) =>
          isNil(value) ? null : normalize(value, dateTimeFieldNames.has(fieldNames[k])),
        ),
      ]),
    );
  });

  return keys;
};

export default composeUniqueKeys;
