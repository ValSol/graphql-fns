const isNil = (value: unknown) => value === undefined || value === null;

// mongo ids, numbers & strings are compared as strings, dates by time
const isSameValue = (entityValue: any, value: any) =>
  entityValue instanceof Date
    ? entityValue.getTime() === new Date(value).getTime()
    : String(entityValue) === String(value);

// "entity" (got from db) is selected by "where" ("whereOne" or "whereCompoundOne" of an item):...
// ... "id" is compared with "_id", "null" matches an absent field (as in mongo query)
const matchWhere = (entity: Record<string, any>, where: Record<string, any>): boolean =>
  Object.keys(where).every((key) => {
    const value = where[key];
    const entityValue = key === 'id' ? entity._id : entity[key];

    if (value === null) return isNil(entityValue);

    if (isNil(entityValue)) return false;

    if (Array.isArray(entityValue)) {
      return entityValue.some((item) => isSameValue(item, value));
    }

    return isSameValue(entityValue, value);
  });

export default matchWhere;
