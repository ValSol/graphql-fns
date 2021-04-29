// @flow

import type { InputCreator } from '../../flowTypes';

import createThingCreateInputType from './createThingCreateInputType';
import isOppositeRequired from './isOppositeRequired';

const createThingUpdateInputType: InputCreator = (thingConfig) => {
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
  } = thingConfig;

  const inputName = `${name}UpdateInput`;
  const childChain = {};

  const thingTypeArray = [`input ${name}UpdateInput {`];

  if (textFields) {
    textFields
      .filter(({ freeze }) => !freeze)
      .reduce((prev, { array, name: name2 }) => {
        prev.push(`  ${name2}: ${array ? '[' : ''}String${array ? '!]' : ''}`);
        return prev;
      }, thingTypeArray);
  }

  if (intFields) {
    intFields
      .filter(({ freeze }) => !freeze)
      .reduce((prev, { array, name: name2 }) => {
        prev.push(`  ${name2}: ${array ? '[' : ''}Int${array ? '!]' : ''}`);
        return prev;
      }, thingTypeArray);
  }

  if (floatFields) {
    floatFields
      .filter(({ freeze }) => !freeze)
      .reduce((prev, { array, name: name2 }) => {
        prev.push(`  ${name2}: ${array ? '[' : ''}Float${array ? '!]' : ''}`);
        return prev;
      }, thingTypeArray);
  }

  if (dateTimeFields) {
    dateTimeFields
      .filter(({ freeze }) => !freeze)
      .reduce((prev, { array, name: name2 }) => {
        prev.push(`  ${name2}: ${array ? '[' : ''}DateTime${array ? '!]' : ''}`);
        return prev;
      }, thingTypeArray);
  }

  if (booleanFields) {
    booleanFields
      .filter(({ freeze }) => !freeze)
      .reduce((prev, { array, name: name2 }) => {
        prev.push(`  ${name2}: ${array ? '[' : ''}Boolean${array ? '!]' : ''}`);
        return prev;
      }, thingTypeArray);
  }

  if (enumFields) {
    enumFields
      .filter(({ freeze }) => !freeze)
      .reduce((prev, { array, enumName, name: name2 }) => {
        prev.push(`  ${name2}: ${array ? '[' : ''}${enumName}Enumeration${array ? '!]' : ''}`);
        return prev;
      }, thingTypeArray);
  }

  if (relationalFields) {
    relationalFields
      .filter(({ freeze }) => !freeze)
      .reduce((prev, { array, name: name2, config, config: { name: relationalThingName } }) => {
        prev.push(
          `  ${name2}: ${relationalThingName}${
            array ? 'CreateOrPushChildrenInput' : 'CreateChildInput'
          }`,
        );

        childChain[`${relationalThingName}CreateInput`] = [createThingCreateInputType, config];

        return prev;
      }, thingTypeArray);
  }

  // the same code as for relationalFields
  if (duplexFields) {
    duplexFields
      .filter(({ freeze }) => !freeze)
      .reduce(
        (
          prev,
          { array, name: name2, oppositeName, config, config: { name: relationalThingName } },
        ) => {
          const oppositeRequired = isOppositeRequired(oppositeName, config);
          if (oppositeRequired) {
            prev.push(
              `  ${name2}: ${relationalThingName}${
                array
                  ? `CreateOrPushThru_${oppositeName}_FieldChildrenInput`
                  : `CreateThru_${oppositeName}_FieldChildInput`
              }`,
            );
          } else {
            prev.push(
              `  ${name2}: ${relationalThingName}${
                array ? 'CreateOrPushChildrenInput' : 'CreateChildInput'
              }`,
            );
          }

          childChain[`${relationalThingName}CreateInput`] = [createThingCreateInputType, config];

          return prev;
        },
        thingTypeArray,
      );
  }

  if (embeddedFields) {
    embeddedFields
      .filter(({ freeze }) => !freeze)
      .reduce((prev, { array, name: name2, config, config: { name: embeddedName } }) => {
        prev.push(`  ${name2}: ${array ? '[' : ''}${embeddedName}UpdateInput${array ? '!]' : ''}`);

        childChain[`${embeddedName}UpdateInput`] = [createThingUpdateInputType, config];

        return prev;
      }, thingTypeArray);
  }

  // the same code as for embeddedFields
  if (fileFields) {
    fileFields
      .filter(({ freeze }) => !freeze)
      .reduce((prev, { array, name: name2, config, config: { name: embeddedName } }) => {
        prev.push(`  ${name2}: ${array ? '[' : ''}${embeddedName}UpdateInput${array ? '!]' : ''}`);

        childChain[`${embeddedName}UpdateInput`] = [createThingUpdateInputType, config];

        return prev;
      }, thingTypeArray);
  }

  if (geospatialFields) {
    geospatialFields
      .filter(({ freeze }) => !freeze)
      .reduce((prev, { array, name: name2, geospatialType }) => {
        prev.push(
          `  ${name2}: ${array ? '[' : ''}Geospatial${geospatialType}Input${array ? '!]' : ''}`,
        );
        return prev;
      }, thingTypeArray);
  }

  if (thingTypeArray.length === 1) return [inputName, '', {}];

  thingTypeArray.push('}');

  const inputDefinition = thingTypeArray.join('\n');

  return [inputName, inputDefinition, childChain];
};

export default createThingUpdateInputType;
