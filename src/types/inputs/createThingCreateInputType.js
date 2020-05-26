// @flow

import type { ThingConfig } from '../../flowTypes';

const isOppositeRequired = (oppositeName, config) => {
  const { name, duplexFields } = config;
  if (!duplexFields) throw new TypeError(`Thing: "${name}" mast have duplexFields!`);
  const oppositeField = duplexFields.find(({ name: fieldName }) => fieldName === oppositeName);
  if (!oppositeField) {
    throw new TypeError(`Thing: "${name}" mast have "${oppositeName}" duplexField!`);
  }
  return oppositeField.required;
};

const createThingCreateInputType = (thingConfig: ThingConfig): string => {
  const {
    booleanFields,
    dateTimeFields,
    duplexFields,
    embedded,
    embeddedFields,
    enumFields,
    fileFields,
    floatFields,
    intFields,
    geospatialFields,
    relationalFields,
    textFields,
    name,
  } = thingConfig;

  const thingTypeArray: Array<Array<string>> = [[`input ${name}CreateInput {`]];

  if (duplexFields) {
    duplexFields.reduce((prev, { name: name2, required }) => {
      if (required) {
        prev.push([`input ${name}CreateThru_${name2}_FieldInput {`]);
      }
      return prev;
    }, thingTypeArray);

    for (let i = 0; i < thingTypeArray.length; i += 1) {
      let requiredCount = 1;
      duplexFields.reduce(
        (
          prev,
          {
            array,
            name: name2,
            oppositeName,
            required,
            config,
            config: { name: relationalThingName },
          },
        ) => {
          const oppositeRequired = isOppositeRequired(oppositeName, config);
          if (oppositeRequired) {
            prev.push(
              `  ${name2}: ${relationalThingName}${
                array
                  ? `CreateOrPushThru_${oppositeName}_FieldChildrenInput`
                  : `CreateThru_${oppositeName}_FieldChildInput`
              }${required && requiredCount !== i ? '!' : ''}`,
            );
          } else {
            prev.push(
              `  ${name2}: ${relationalThingName}${
                array ? 'CreateOrPushChildrenInput' : 'CreateChildInput'
              }${required && requiredCount !== i ? '!' : ''}`,
            );
          }
          if (required) requiredCount += 1;
          return prev;
        },
        thingTypeArray[i],
      );
    }
  }

  if (textFields) {
    for (let i = 0; i < thingTypeArray.length; i += 1) {
      textFields.reduce((prev, { array, name: name2, required }) => {
        prev.push(
          `  ${name2}: ${array ? '[' : ''}String${array ? '!]' : ''}${required ? '!' : ''}`,
        );
        return prev;
      }, thingTypeArray[i]);
    }
  }

  if (intFields) {
    for (let i = 0; i < thingTypeArray.length; i += 1) {
      intFields.reduce((prev, { array, name: name2, required }) => {
        prev.push(`  ${name2}: ${array ? '[' : ''}Int${array ? '!]' : ''}${required ? '!' : ''}`);
        return prev;
      }, thingTypeArray[i]);
    }
  }

  if (floatFields) {
    for (let i = 0; i < thingTypeArray.length; i += 1) {
      floatFields.reduce((prev, { array, name: name2, required }) => {
        prev.push(`  ${name2}: ${array ? '[' : ''}Float${array ? '!]' : ''}${required ? '!' : ''}`);
        return prev;
      }, thingTypeArray[i]);
    }
  }

  if (dateTimeFields) {
    for (let i = 0; i < thingTypeArray.length; i += 1) {
      dateTimeFields.reduce((prev, { array, name: name2, required }) => {
        prev.push(
          `  ${name2}: ${array ? '[' : ''}DateTime${array ? '!]' : ''}${required ? '!' : ''}`,
        );
        return prev;
      }, thingTypeArray[i]);
    }
  }

  if (booleanFields) {
    for (let i = 0; i < thingTypeArray.length; i += 1) {
      booleanFields.reduce((prev, { array, name: name2, required }) => {
        prev.push(
          `  ${name2}: ${array ? '[' : ''}Boolean${array ? '!]' : ''}${required ? '!' : ''}`,
        );
        return prev;
      }, thingTypeArray[i]);
    }
  }

  if (enumFields) {
    for (let i = 0; i < thingTypeArray.length; i += 1) {
      enumFields.reduce((prev, { array, enumName, name: name2, required }) => {
        prev.push(
          `  ${name2}: ${array ? '[' : ''}${enumName}Enumeration${array ? '!]' : ''}${
            required ? '!' : ''
          }`,
        );
        return prev;
      }, thingTypeArray[i]);
    }
  }

  if (relationalFields) {
    for (let i = 0; i < thingTypeArray.length; i += 1) {
      relationalFields.reduce(
        (prev, { array, name: name2, required, config: { name: relationalThingName } }) => {
          prev.push(
            `  ${name2}: ${relationalThingName}${
              array ? 'CreateOrPushChildrenInput' : 'CreateChildInput'
            }${required ? '!' : ''}`,
          );
          return prev;
        },
        thingTypeArray[i],
      );
    }
  }

  if (embeddedFields) {
    for (let i = 0; i < thingTypeArray.length; i += 1) {
      embeddedFields.reduce(
        (prev, { array, name: name2, required, config: { name: embeddedName } }) => {
          prev.push(
            `  ${name2}: ${array ? '[' : ''}${embeddedName}CreateInput${array ? '!]' : ''}${
              required ? '!' : ''
            }`,
          );
          return prev;
        },
        thingTypeArray[i],
      );
    }
  }

  // the same code as for embeddedFields
  if (fileFields) {
    for (let i = 0; i < thingTypeArray.length; i += 1) {
      fileFields.reduce(
        (prev, { array, name: name2, required, config: { name: embeddedName } }) => {
          prev.push(
            `  ${name2}: ${array ? '[' : ''}${embeddedName}CreateInput${array ? '!]' : ''}${
              required ? '!' : ''
            }`,
          );
          return prev;
        },
        thingTypeArray[i],
      );
    }
  }

  if (geospatialFields) {
    for (let i = 0; i < thingTypeArray.length; i += 1) {
      geospatialFields.reduce((prev, { array, name: name2, geospatialType, required }) => {
        prev.push(
          `  ${name2}: ${array ? '[' : ''}Geospatial${geospatialType}Input${array ? '!]' : ''}${
            required ? '!' : ''
          }`,
        );
        return prev;
      }, thingTypeArray[i]);
    }
  }

  for (let i = 0; i < thingTypeArray.length; i += 1) {
    thingTypeArray[i].push('}');
  }

  const thingTypeArray2 = thingTypeArray.map((arr) => arr.join('\n'));

  if (!embedded) {
    thingTypeArray2.push(`input ${name}CreateChildInput {
  connect: ID
  create: ${name}CreateInput
}
input ${name}CreateOrPushChildrenInput {
  connect: [ID!]
  create: [${name}CreateInput!]
}`);

    if (duplexFields) {
      duplexFields.reduce((prev, { name: name2, required }) => {
        if (required) {
          thingTypeArray2.push(`input ${name}CreateThru_${name2}_FieldChildInput {
  connect: ID
  create: ${name}CreateThru_${name2}_FieldInput
}
input ${name}CreateOrPushThru_${name2}_FieldChildrenInput {
  connect: [ID!]
  create: [${name}CreateThru_${name2}_FieldInput!]
}`);
        }
        return prev;
      }, thingTypeArray2);
    }
  }

  const result = thingTypeArray2.join('\n');

  return result;
};

export default createThingCreateInputType;
