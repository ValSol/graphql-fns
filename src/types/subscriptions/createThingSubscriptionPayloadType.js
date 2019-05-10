// @flow
import type { ThingConfig } from '../../flowTypes';

const createThingSubscriptionPayloadType = (thingConfig: ThingConfig): string => {
  const {
    booleanFields,
    duplexFields,
    embeddedFields,
    enumFields,
    geospatialFields,
    relationalFields,
    name,
  } = thingConfig;

  const scalarFieldTypeNames = ['textFields', 'intFields', 'floatFields', 'dateTimeFields'];
  const thingFieldsArray = scalarFieldTypeNames.reduce((prev, fieldTypeName) => {
    if (thingConfig[fieldTypeName]) {
      thingConfig[fieldTypeName].forEach(({ name: name2 }) => prev.push(`  ${name2}`));
    }
    return prev;
  }, []);

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
type ${name}SubscriptionPayload {
  mutation: ${name}SubscriptionMutationEnumeration!
  node: ${name}
  previousNode: ${name}
  updatedFields: [${name}FieldNamesEnumeration!]
}`;

  return result;
};

module.exports = createThingSubscriptionPayloadType;
