import type { InputCreator } from '../../tsTypes';

import createEntityCreateInputType from './createEntityCreateInputType';
import createEntityWhereInputType from './createEntityWhereInputType';
import createEntityWhereOneInputType from './createEntityWhereOneInputType';
import isOppositeRequired from './isOppositeRequired';

const createEntityUpdateInputType: InputCreator = (entityConfig) => {
  const {
    booleanFields = [],
    dateTimeFields = [],
    embeddedFields = [],
    enumFields = [],
    fileFields = [],
    floatFields = [],
    intFields = [],
    geospatialFields = [],
    textFields = [],
    name,
    type: configType, // in file configs not take into account freeze fields
  } = entityConfig;

  const inputName = `${name}UpdateInput`;
  const childChain: Record<string, any> = {};

  const entityTypeArray = [`input ${name}UpdateInput {`];

  textFields
    .filter(({ freeze }) => configType === 'file' || !freeze)
    .reduce((prev, { array, name: name2 }) => {
      prev.push(`  ${name2}: ${array ? '[' : ''}String${array ? '!]' : ''}`);
      return prev;
    }, entityTypeArray);

  intFields
    .filter(({ freeze }) => configType === 'file' || !freeze)
    .reduce((prev, { array, name: name2 }) => {
      prev.push(`  ${name2}: ${array ? '[' : ''}Int${array ? '!]' : ''}`);
      return prev;
    }, entityTypeArray);

  floatFields
    .filter(({ freeze }) => configType === 'file' || !freeze)
    .reduce((prev, { array, name: name2 }) => {
      prev.push(`  ${name2}: ${array ? '[' : ''}Float${array ? '!]' : ''}`);
      return prev;
    }, entityTypeArray);

  dateTimeFields
    .filter(({ freeze }) => configType === 'file' || !freeze)
    .reduce((prev, { array, name: name2 }) => {
      prev.push(`  ${name2}: ${array ? '[' : ''}DateTime${array ? '!]' : ''}`);
      return prev;
    }, entityTypeArray);

  booleanFields
    .filter(({ freeze }) => configType === 'file' || !freeze)
    .reduce((prev, { array, name: name2 }) => {
      prev.push(`  ${name2}: ${array ? '[' : ''}Boolean${array ? '!]' : ''}`);
      return prev;
    }, entityTypeArray);

  enumFields
    .filter(({ freeze }) => configType === 'file' || !freeze)
    .reduce((prev, { array, enumName, name: name2 }) => {
      prev.push(`  ${name2}: ${array ? '[' : ''}${enumName}Enumeration${array ? '!]' : ''}`);
      return prev;
    }, entityTypeArray);

  if (configType === 'tangible') {
    const { duplexFields = [], filterFields = [], relationalFields = [] } = entityConfig;

    relationalFields
      .filter(({ freeze, parent }) => !parent && !freeze)
      .reduce((prev, { array, name: name2, config, config: { name: relationalEntityName } }) => {
        prev.push(
          `  ${name2}: ${relationalEntityName}${
            array ? 'CreateOrPushChildrenInput' : 'CreateChildInput'
          }`,
        );

        childChain[`${relationalEntityName}CreateInput`] = [createEntityCreateInputType, config];

        return prev;
      }, entityTypeArray);

    duplexFields
      .filter(({ freeze }) => !freeze)
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

    filterFields
      .filter(({ freeze }) => !freeze)
      .reduce((prev, { name: name2, array, config: config2, config: { name: entityName } }) => {
        if (array) {
          prev.push(`  ${name2}: ${entityName}WhereInput`);

          childChain[`${entityName}WhereInput`] = [createEntityWhereInputType, config2];
        } else {
          prev.push(`  ${name2}: ${entityName}WhereOneInput`);

          childChain[`${entityName}WhereOneInput`] = [createEntityWhereOneInputType, config2];
        }

        return prev;
      }, entityTypeArray);
  }

  embeddedFields
    .filter(({ freeze }) => configType === 'file' || !freeze)
    .reduce((prev, { array, name: name2, config, config: { name: embeddedName } }) => {
      prev.push(`  ${name2}: ${array ? '[' : ''}${embeddedName}UpdateInput${array ? '!]' : ''}`);

      childChain[`${embeddedName}UpdateInput`] = [createEntityUpdateInputType, config];

      return prev;
    }, entityTypeArray);

  // the same code as for embeddedFields
  fileFields
    .filter(({ freeze }) => configType === 'file' || !freeze)
    .reduce((prev, { array, name: name2, config, config: { name: embeddedName } }) => {
      prev.push(`  ${name2}: ${array ? '[' : ''}${embeddedName}UpdateInput${array ? '!]' : ''}`);

      childChain[`${embeddedName}UpdateInput`] = [createEntityUpdateInputType, config];

      return prev;
    }, entityTypeArray);

  geospatialFields
    .filter(({ freeze }) => configType === 'file' || !freeze)
    .reduce((prev, { array, name: name2, geospatialType }) => {
      prev.push(
        `  ${name2}: ${array ? '[' : ''}Geospatial${geospatialType}Input${array ? '!]' : ''}`,
      );
      return prev;
    }, entityTypeArray);

  if (entityTypeArray.length === 1) return [inputName, '', {}];

  entityTypeArray.push('}');

  const inputDefinition = entityTypeArray.join('\n');

  return [inputName, inputDefinition, childChain];
};

export default createEntityUpdateInputType;
