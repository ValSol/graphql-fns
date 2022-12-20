// @flow

import type { EntityConfig, Inventory } from '../flowTypes';

import checkInventory from '../utils/inventory/checkInventory';
import { queryAttributes } from './actionAttributes';
import composeChildActionSignature from './composeChildActionSignature';

const { childEntities, childEntitiesThroughConnection, childEntity } = queryAttributes;

const composeReturnString = (config, actionAttributes) =>
  actionAttributes.actionReturnString('')(config);

const arrayArgs = '(slice: SliceInput)';

const createEntityType = (
  entityConfig: EntityConfig,
  inputDic: { [inputName: string]: string },
  inventory?: Inventory,
): string => {
  const {
    childFields,
    counter,
    booleanFields,
    dateTimeFields,
    duplexFields = [],
    embeddedFields,
    enumFields,
    fileFields,
    floatFields,
    intFields,
    geospatialFields,
    relationalFields = [],
    textFields,
    type: configType,
    name,
  } = entityConfig;

  const entityTypeArray = [
    // use not required ID in embedded entities...
    // ... to not provoke error for null embedded objects
    `type ${name} ${
      configType === 'tangible' || configType === 'tangibleFile' ? 'implements Node ' : ''
    }{`,
  ];

  if (configType !== 'virtual') {
    entityTypeArray.push('  id: ID!');
  }

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

  [...relationalFields, ...duplexFields].reduce(
    (prev, { array, name: name2, required, config }) => {
      if (array) {
        const childEntitiesArgs = composeChildActionSignature(
          config,
          'childEntities',
          inputDic,
          inventory,
        );

        if (childEntitiesArgs) {
          prev.push(
            `  ${name2}(${childEntitiesArgs}): ${composeReturnString(config, childEntities)}`,
          );
        }

        const childEntitiesThroughConnectionArgs = composeChildActionSignature(
          config,
          'childEntitiesThroughConnection',
          inputDic,
          inventory,
        );

        if (childEntitiesThroughConnectionArgs) {
          prev.push(
            `  ${name2}ThroughConnection(${childEntitiesThroughConnectionArgs}): ${composeReturnString(
              config,
              childEntitiesThroughConnection,
            )}`,
          );
        }
      } else if (checkInventory(['Query', 'childEntity', config.name])) {
        prev.push(`  ${name2}: ${composeReturnString(config, childEntity)}${required ? '!' : ''}`);
      }

      return prev;
    },
    entityTypeArray,
  );

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

  if (childFields) {
    childFields.reduce((prev, { array, name: name2, required, config: { name: childName } }) => {
      prev.push(
        `  ${name2}: ${array ? '[' : ''}${childName}${array ? '!]!' : ''}${
          !array && required ? '!' : ''
        }`,
      );
      return prev;
    }, entityTypeArray);
  }

  entityTypeArray.push('}');

  const result = entityTypeArray.join('\n');

  return result;
};

export default createEntityType;
