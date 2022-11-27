// @flow

import type { InputCreator } from '../../flowTypes';

import createEntityCreateInputType from './createEntityCreateInputType';
import isOppositeRequired from './isOppositeRequired';

const createEntityUpdateInputType: InputCreator = (entityConfig) => {
  const {
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
    name,
    type: configType, // in file configs not take into account freeze fields
  } = entityConfig;

  const inputName = `${name}UpdateInput`;
  const childChain = {};

  const entityTypeArray = [`input ${name}UpdateInput {`];

  if (textFields) {
    textFields
      .filter(({ freeze }) => configType === 'file' || !freeze)
      .reduce((prev, { array, name: name2 }) => {
        prev.push(`  ${name2}: ${array ? '[' : ''}String${array ? '!]' : ''}`);
        return prev;
      }, entityTypeArray);
  }

  if (intFields) {
    intFields
      .filter(({ freeze }) => configType === 'file' || !freeze)
      .reduce((prev, { array, name: name2 }) => {
        prev.push(`  ${name2}: ${array ? '[' : ''}Int${array ? '!]' : ''}`);
        return prev;
      }, entityTypeArray);
  }

  if (floatFields) {
    floatFields
      .filter(({ freeze }) => configType === 'file' || !freeze)
      .reduce((prev, { array, name: name2 }) => {
        prev.push(`  ${name2}: ${array ? '[' : ''}Float${array ? '!]' : ''}`);
        return prev;
      }, entityTypeArray);
  }

  if (dateTimeFields) {
    dateTimeFields
      .filter(({ freeze }) => configType === 'file' || !freeze)
      .reduce((prev, { array, name: name2 }) => {
        prev.push(`  ${name2}: ${array ? '[' : ''}DateTime${array ? '!]' : ''}`);
        return prev;
      }, entityTypeArray);
  }

  if (booleanFields) {
    booleanFields
      .filter(({ freeze }) => configType === 'file' || !freeze)
      .reduce((prev, { array, name: name2 }) => {
        prev.push(`  ${name2}: ${array ? '[' : ''}Boolean${array ? '!]' : ''}`);
        return prev;
      }, entityTypeArray);
  }

  if (enumFields) {
    enumFields
      .filter(({ freeze }) => configType === 'file' || !freeze)
      .reduce((prev, { array, enumName, name: name2 }) => {
        prev.push(`  ${name2}: ${array ? '[' : ''}${enumName}Enumeration${array ? '!]' : ''}`);
        return prev;
      }, entityTypeArray);
  }

  if (relationalFields) {
    relationalFields
      .filter(({ freeze }) => configType === 'file' || !freeze)
      .reduce((prev, { array, name: name2, config, config: { name: relationalEntityName } }) => {
        prev.push(
          `  ${name2}: ${relationalEntityName}${
            array ? 'CreateOrPushChildrenInput' : 'CreateChildInput'
          }`,
        );

        childChain[`${relationalEntityName}CreateInput`] = [createEntityCreateInputType, config];

        return prev;
      }, entityTypeArray);
  }

  // the same code as for relationalFields
  if (duplexFields) {
    duplexFields
      .filter(({ freeze }) => configType === 'file' || !freeze)
      .reduce(
        (
          prev,
          { array, name: name2, oppositeName, config, config: { name: relationalEntityName } },
        ) => {
          const oppositeRequired = isOppositeRequired(oppositeName, config);
          if (oppositeRequired) {
            prev.push(
              `  ${name2}: ${relationalEntityName}${
                array
                  ? `CreateOrPushThru_${oppositeName}_FieldChildrenInput`
                  : `CreateThru_${oppositeName}_FieldChildInput`
              }`,
            );
          } else {
            prev.push(
              `  ${name2}: ${relationalEntityName}${
                array ? 'CreateOrPushChildrenInput' : 'CreateChildInput'
              }`,
            );
          }

          childChain[`${relationalEntityName}CreateInput`] = [createEntityCreateInputType, config];

          return prev;
        },
        entityTypeArray,
      );
  }

  if (embeddedFields) {
    embeddedFields
      .filter(({ freeze }) => configType === 'file' || !freeze)
      .reduce((prev, { array, name: name2, config, config: { name: embeddedName } }) => {
        prev.push(`  ${name2}: ${array ? '[' : ''}${embeddedName}UpdateInput${array ? '!]' : ''}`);

        childChain[`${embeddedName}UpdateInput`] = [createEntityUpdateInputType, config];

        return prev;
      }, entityTypeArray);
  }

  // the same code as for embeddedFields
  if (fileFields) {
    fileFields
      .filter(({ freeze }) => configType === 'file' || !freeze)
      .reduce((prev, { array, name: name2, config, config: { name: embeddedName } }) => {
        prev.push(`  ${name2}: ${array ? '[' : ''}${embeddedName}UpdateInput${array ? '!]' : ''}`);

        childChain[`${embeddedName}UpdateInput`] = [createEntityUpdateInputType, config];

        return prev;
      }, entityTypeArray);
  }

  if (geospatialFields) {
    geospatialFields
      .filter(({ freeze }) => configType === 'file' || !freeze)
      .reduce((prev, { array, name: name2, geospatialType }) => {
        prev.push(
          `  ${name2}: ${array ? '[' : ''}Geospatial${geospatialType}Input${array ? '!]' : ''}`,
        );
        return prev;
      }, entityTypeArray);
  }

  if (entityTypeArray.length === 1) return [inputName, '', {}];

  entityTypeArray.push('}');

  const inputDefinition = entityTypeArray.join('\n');

  return [inputName, inputDefinition, childChain];
};

export default createEntityUpdateInputType;
