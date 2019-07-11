// @flow
import type { ThingConfig } from '../../flowTypes';

const createUpdatedThingPayloadType = (thingConfig: ThingConfig): string => {
  const {
    booleanFields,
    dateTimeFields,
    duplexFields,
    embeddedFields,
    enumFields,
    intFields,
    floatFields,
    geospatialFields,
    relationalFields,
    textFields,
    name,
  } = thingConfig;

  const thingFieldsArray = [];

  if (textFields) {
    textFields.reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}`);
      return prev;
    }, thingFieldsArray);
  }

  if (intFields) {
    intFields.reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}`);
      return prev;
    }, thingFieldsArray);
  }

  if (floatFields) {
    floatFields.reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}`);
      return prev;
    }, thingFieldsArray);
  }

  if (dateTimeFields) {
    dateTimeFields.reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}`);
      return prev;
    }, thingFieldsArray);
  }

  if (booleanFields) {
    booleanFields.reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}`);
      return prev;
    }, thingFieldsArray);
  }

  if (duplexFields) {
    duplexFields.reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}`);
      return prev;
    }, thingFieldsArray);
  }

  if (embeddedFields) {
    embeddedFields.reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}`);
      return prev;
    }, thingFieldsArray);
  }

  if (enumFields) {
    enumFields.reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}`);
      return prev;
    }, thingFieldsArray);
  }

  if (geospatialFields) {
    geospatialFields.reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}`);
      return prev;
    }, thingFieldsArray);
  }

  if (relationalFields) {
    relationalFields.reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}`);
      return prev;
    }, thingFieldsArray);
  }

  const result = `enum ${name}FieldNamesEnumeration {
${thingFieldsArray.join('\n')}
}
type Updated${name}Payload {
  node: ${name}
  previousNode: ${name}
  updatedFields: [${name}FieldNamesEnumeration!]
}`;

  return result;
};

export default createUpdatedThingPayloadType;
