// @flow

import type { EntityConfig } from '../flowTypes';

import composeChildActionSignature from './composeChildActionSignature';

const arrayArgs = '(slice: SliceInput)';

const createEntityType = (
  entityConfig: EntityConfig,
  dic: { [inputName: string]: string },
): string => {
  const {
    counter,
    booleanFields,
    dateTimeFields,
    duplexFields,
    embeddedFields,
    enumFields,
    fileFields,
    floatFields,
    intFields,
    geospatialFields,
    relationalFields,
    textFields,
    type: configType,
    name,
  } = entityConfig;

  const entityTypeArray = [
    // use not required ID in embedded entities...
    // ... to not provoke error for null embedded objects
    `type ${name} ${
      configType === 'tangible' || configType === 'tangibleFile' ? 'implements Node ' : ''
    }{
  id: ID!`,
  ];

  if (configType === 'tangible') {
    entityTypeArray.push(`  createdAt: DateTime!
  updatedAt: DateTime!`);
  }

  if (counter) {
    entityTypeArray.push('  counter: Int!');
  }

  if (textFields) {
    textFields.reduce((prev, { array, name: name2, required }) => {
      prev.push(
        `  ${name2}${array ? arrayArgs : ''}: ${array ? '[' : ''}String${array ? '!]!' : ''}${
          !array && required ? '!' : ''
        }`,
      );
      return prev;
    }, entityTypeArray);
  }

  if (intFields) {
    intFields.reduce((prev, { array, name: name2, required }) => {
      prev.push(
        `  ${name2}${array ? arrayArgs : ''}: ${array ? '[' : ''}Int${array ? '!]!' : ''}${
          !array && required ? '!' : ''
        }`,
      );
      return prev;
    }, entityTypeArray);
  }

  if (floatFields) {
    floatFields.reduce((prev, { array, name: name2, required }) => {
      prev.push(
        `  ${name2}${array ? arrayArgs : ''}: ${array ? '[' : ''}Float${array ? '!]!' : ''}${
          !array && required ? '!' : ''
        }`,
      );
      return prev;
    }, entityTypeArray);
  }

  if (dateTimeFields) {
    dateTimeFields.reduce((prev, { array, name: name2, required }) => {
      prev.push(
        `  ${name2}${array ? arrayArgs : ''}: ${array ? '[' : ''}DateTime${array ? '!]!' : ''}${
          !array && required ? '!' : ''
        }`,
      );
      return prev;
    }, entityTypeArray);
  }

  if (booleanFields) {
    booleanFields.reduce((prev, { array, name: name2, required }) => {
      prev.push(
        `  ${name2}${array ? arrayArgs : ''}: ${array ? '[' : ''}Boolean${array ? '!]!' : ''}${
          !array && required ? '!' : ''
        }`,
      );
      return prev;
    }, entityTypeArray);
  }

  if (enumFields) {
    enumFields.reduce((prev, { array, enumName, name: name2, required }) => {
      prev.push(
        `  ${name2}${array ? arrayArgs : ''}: ${array ? '[' : ''}${enumName}Enumeration${
          array ? '!]!' : ''
        }${!array && required ? '!' : ''}`,
      );
      return prev;
    }, entityTypeArray);
  }

  if (relationalFields) {
    relationalFields.reduce((prev, { array, name: name2, required, config }) => {
      const { name: relationalEntityName } = config;
      prev.push(
        `  ${name2}${array ? `(${composeChildActionSignature(config, dic)})` : ''}: ${
          array ? '[' : ''
        }${relationalEntityName}${array ? '!]!' : ''}${!array && required ? '!' : ''}`,
      );
      return prev;
    }, entityTypeArray);
  }

  // the same code as for relationalFields
  if (duplexFields) {
    duplexFields.reduce((prev, { array, name: name2, required, config }) => {
      const { name: relationalEntityName } = config;
      prev.push(
        `  ${name2}${array ? `(${composeChildActionSignature(config, dic)})` : ''}: ${
          array ? '[' : ''
        }${relationalEntityName}${array ? '!]!' : ''}${!array && required ? '!' : ''}`,
      );
      return prev;
    }, entityTypeArray);
  }

  if (embeddedFields) {
    embeddedFields.reduce(
      (prev, { array, name: name2, required, config: { name: embeddedName } }) => {
        prev.push(
          `  ${name2}${array ? arrayArgs : ''}: ${array ? '[' : ''}${embeddedName}${
            array ? '!]!' : ''
          }${!array && required ? '!' : ''}`,
        );
        return prev;
      },
      entityTypeArray,
    );
  }

  // the same code as for embeddedFields
  if (fileFields) {
    fileFields.reduce((prev, { array, name: name2, required, config: { name: embeddedName } }) => {
      prev.push(
        `  ${name2}${array ? arrayArgs : ''}: ${array ? '[' : ''}${embeddedName}${
          array ? '!]!' : ''
        }${!array && required ? '!' : ''}`,
      );
      return prev;
    }, entityTypeArray);
  }

  if (geospatialFields) {
    geospatialFields.reduce((prev, { array, name: name2, geospatialType, required }) => {
      prev.push(
        `  ${name2}${array ? arrayArgs : ''}: ${array ? '[' : ''}Geospatial${geospatialType}${
          array ? '!]!' : ''
        }${!array && required ? '!' : ''}`,
      );
      return prev;
    }, entityTypeArray);
  }

  entityTypeArray.push('}');

  if (configType === 'tangible') {
    entityTypeArray.push(`type ${name}Edge {
  node: ${name}
  cursor: String!
}
type ${name}Connection {
  pageInfo: PageInfo!
  edges: [${name}Edge!]
}`);
  }

  const result = entityTypeArray.join('\n');

  return result;
};

export default createEntityType;
