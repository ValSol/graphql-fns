// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingCreateInputType = (thingConfig: ThingConfig): string => {
  const {
    booleanFields,
    duplexFields,
    embedded,
    embeddedFields,
    enumFields,
    geospatialFields,
    relationalFields,
    name,
  } = thingConfig;

  const thingTypeArray = [`input ${name}CreateInput {`];

  const scalarFieldTypes = [
    { fieldTypeName: 'textFields', gqlType: 'String' },
    { fieldTypeName: 'intFields', gqlType: 'Int' },
    { fieldTypeName: 'floatFields', gqlType: 'Float' },
    { fieldTypeName: 'dateTimeFields', gqlType: 'DateTime' },
  ];

  scalarFieldTypes.reduce((prev, { fieldTypeName, gqlType }) => {
    if (thingConfig[fieldTypeName]) {
      thingConfig[fieldTypeName].forEach(({ array, name: name2, required }) =>
        prev.push(
          `  ${name2}: ${array ? '[' : ''}${gqlType}${array ? '!]' : ''}${required ? '!' : ''}`,
        ),
      );
    }
    return prev;
  }, thingTypeArray);

  if (booleanFields) {
    booleanFields.reduce((prev, { array, name: name2, required }) => {
      prev.push(`  ${name2}: ${array ? '[' : ''}Boolean${array ? '!]' : ''}${required ? '!' : ''}`);
      return prev;
    }, thingTypeArray);
  }

  if (enumFields) {
    enumFields.reduce((prev, { array, enumName, name: name2, required }) => {
      prev.push(
        `  ${name2}: ${array ? '[' : ''}${enumName}Enumeration${array ? '!]' : ''}${
          required ? '!' : ''
        }`,
      );
      return prev;
    }, thingTypeArray);
  }

  if (relationalFields) {
    relationalFields.reduce(
      (prev, { array, name: name2, required, config: { name: relationalThingName } }) => {
        prev.push(
          `  ${name2}: ${relationalThingName}${array ? 'CreateChildrenInput' : 'CreateChildInput'}${
            required ? '!' : ''
          }`,
        );
        return prev;
      },
      thingTypeArray,
    );
  }

  // the same code as for relationalFields
  if (duplexFields) {
    duplexFields.reduce(
      (prev, { array, name: name2, required, config: { name: relationalThingName } }) => {
        prev.push(
          `  ${name2}: ${relationalThingName}${array ? 'CreateChildrenInput' : 'CreateChildInput'}${
            required ? '!' : ''
          }`,
        );
        return prev;
      },
      thingTypeArray,
    );
  }

  if (embeddedFields) {
    embeddedFields.reduce(
      (prev, { array, name: name2, required, config: { name: embeddedName } }) => {
        prev.push(
          `  ${name2}: ${array ? '[' : ''}${embeddedName}CreateInput${array ? '!]' : ''}${
            required ? '!' : ''
          }`,
        );
        return prev;
      },
      thingTypeArray,
    );
  }

  if (geospatialFields) {
    geospatialFields.reduce((prev, { array, name: name2, geospatialType, required }) => {
      prev.push(
        `  ${name2}: ${array ? '[' : ''}Geospatial${geospatialType}Input${array ? '!]' : ''}${
          required ? '!' : ''
        }`,
      );
      return prev;
    }, thingTypeArray);
  }

  thingTypeArray.push('}');

  if (!embedded) {
    thingTypeArray.push(`input ${name}CreateChildInput {
  connect: ID
  create: ${name}CreateInput
}
input ${name}CreateChildrenInput {
  connect: [ID!]
  create: [${name}CreateInput!]
}`);
  }

  const result = thingTypeArray.join('\n');

  return result;
};

export default createThingCreateInputType;
