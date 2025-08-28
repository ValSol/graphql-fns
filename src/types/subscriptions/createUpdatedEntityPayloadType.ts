import type { EntityConfig } from '@/tsTypes';

const createUpdatedEntityPayloadType = (entityConfig: EntityConfig): string => {
  const {
    booleanFields = [],
    dateTimeFields = [],
    embeddedFields = [],
    enumFields = [],
    intFields = [],
    floatFields = [],
    geospatialFields = [],
    textFields = [],
    name,
    type: entityType,
  } = entityConfig;

  const entityFieldsArray: Array<string> = [];

  textFields.reduce((prev, { name: name2 }) => {
    prev.push(`  ${name2}`);
    return prev;
  }, entityFieldsArray);

  intFields.reduce((prev, { name: name2 }) => {
    prev.push(`  ${name2}`);
    return prev;
  }, entityFieldsArray);

  floatFields.reduce((prev, { name: name2 }) => {
    prev.push(`  ${name2}`);
    return prev;
  }, entityFieldsArray);

  dateTimeFields.reduce((prev, { name: name2 }) => {
    prev.push(`  ${name2}`);
    return prev;
  }, entityFieldsArray);

  booleanFields.reduce((prev, { name: name2 }) => {
    prev.push(`  ${name2}`);
    return prev;
  }, entityFieldsArray);

  embeddedFields.reduce((prev, { name: name2 }) => {
    prev.push(`  ${name2}`);
    return prev;
  }, entityFieldsArray);

  if (enumFields) {
    enumFields.reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}`);
      return prev;
    }, entityFieldsArray);
  }

  if (geospatialFields) {
    geospatialFields.reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}`);
      return prev;
    }, entityFieldsArray);
  }

  if (entityType === 'tangible') {
    const { duplexFields = [], relationalFields = [] } = entityConfig;

    duplexFields.reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}`);
      return prev;
    }, entityFieldsArray);

    relationalFields
      .filter(({ parent }) => !parent)
      .reduce((prev, { name: name2 }) => {
        prev.push(`  ${name2}`);
        return prev;
      }, entityFieldsArray);
  }

  const result = `enum ${name}FieldNamesEnum {
${entityFieldsArray.join('\n')}
}
type Updated${name}Payload {
  node: ${name}
  previousNode: ${name}
  updatedFields: [${name}FieldNamesEnum!]
}`;

  return result;
};

export default createUpdatedEntityPayloadType;
