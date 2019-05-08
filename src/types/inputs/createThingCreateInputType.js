// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingCreateInputType = (thingConfig: ThingConfig): string => {
  const {
    duplexFields,
    isEmbedded,
    embeddedFields,
    enumFields,
    geospatialFields,
    relationalFields,
    name,
  } = thingConfig;

  const thingTypeArray = [`input ${name}CreateInput {`];

  const scalarFieldTypes = [
    { fieldTypeName: 'textFields', gqlType: 'String' },
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
    geospatialFields.reduce((prev, { array, name: name2, type, required }) => {
      prev.push(
        `  ${name2}: ${array ? '[' : ''}Geospatial${type}Input${array ? '!]' : ''}${
          required ? '!' : ''
        }`,
      );
      return prev;
    }, thingTypeArray);
  }

  thingTypeArray.push('}');

  if (!isEmbedded) {
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

module.exports = createThingCreateInputType;
