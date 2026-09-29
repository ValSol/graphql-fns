import type { EntityConfig, TangibleEntityConfig } from '@/tsTypes';

// "whereCompoundOne" has to contain exactly the fields of one of "uniqueCompoundIndexes"
// (a field with "null" value is counted as present: it matches an absent value of the field)
const checkWhereCompoundOne = (
  whereCompoundOne: Record<string, any>,
  entityConfig: EntityConfig,
): void => {
  const { name, uniqueCompoundIndexes = [] } = entityConfig as TangibleEntityConfig;

  const keys = Object.keys(whereCompoundOne);

  const isCorrect = uniqueCompoundIndexes.some(
    (fieldNames) =>
      fieldNames.length === keys.length &&
      fieldNames.every((fieldName) => keys.includes(fieldName)),
  );

  if (!isCorrect) {
    throw new TypeError(
      `Got "whereCompoundOne" keys: ${JSON.stringify(
        keys,
      )} of "${name}" entity that not equal to fields of any of "uniqueCompoundIndexes": ${JSON.stringify(
        uniqueCompoundIndexes,
      )}!`,
    );
  }
};

export default checkWhereCompoundOne;
