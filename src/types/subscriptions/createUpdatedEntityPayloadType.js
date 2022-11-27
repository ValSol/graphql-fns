// @flow
import type { EntityConfig } from '../../flowTypes';

const createUpdatedEntityPayloadType = (entityConfig: EntityConfig): string => {
  const {
    booleanFields,
    dateTimeFields,
    duplexFields,
    embeddedFields,
    enumFields,
    intFields,
    fileFields,
    floatFields,
    geospatialFields,
    relationalFields,
    textFields,
    name,
  } = entityConfig;

  const entityFieldsArray = [];

  if (textFields) {
    textFields.reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}`);
      return prev;
    }, entityFieldsArray);
  }

  if (intFields) {
    intFields.reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}`);
      return prev;
    }, entityFieldsArray);
  }

  if (floatFields) {
    floatFields.reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}`);
      return prev;
    }, entityFieldsArray);
  }

  if (dateTimeFields) {
    dateTimeFields.reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}`);
      return prev;
    }, entityFieldsArray);
  }

  if (booleanFields) {
    booleanFields.reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}`);
      return prev;
    }, entityFieldsArray);
  }

  if (duplexFields) {
    duplexFields.reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}`);
      return prev;
    }, entityFieldsArray);
  }

  if (embeddedFields) {
    embeddedFields.reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}`);
      return prev;
    }, entityFieldsArray);
  }

  // the same code as for embeddedFields
  if (fileFields) {
    fileFields.reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}`);
      return prev;
    }, entityFieldsArray);
  }

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

  if (relationalFields) {
    relationalFields.reduce((prev, { name: name2 }) => {
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
