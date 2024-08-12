import type { InputCreator } from '../../tsTypes';

import createEntityCreateInputType from './createEntityCreateInputType';
import createEntityWhereInputType from './createEntityWhereInputType';
import createEntityWhereOneInputType from './createEntityWhereOneInputType';

const createPushIntoEntityInputType: InputCreator = (entityConfig) => {
  const {
    booleanFields = [],
    dateTimeFields = [],
    embeddedFields = [],
    enumFields = [],
    floatFields = [],
    intFields = [],
    geospatialFields = [],
    textFields = [],
    type: configType,
    name,
  } = entityConfig;

  const inputName = `PushInto${name}Input`;

  if (configType !== 'tangible') return [inputName, '', {}];
  const { duplexFields = [], filterFields = [], relationalFields = [] } = entityConfig;

  const entityTypeArray: Array<string> = [];
  const childChain: Record<string, any> = {};

  textFields
    .filter(({ array, freeze }) => array && !freeze)
    .reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}: [String!]`);
      return prev;
    }, entityTypeArray);

  intFields
    .filter(({ array, freeze }) => array && !freeze)
    .reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}: [Int!]`);
      return prev;
    }, entityTypeArray);

  floatFields
    .filter(({ array, freeze }) => array && !freeze)
    .reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}: [Float!]`);
      return prev;
    }, entityTypeArray);

  dateTimeFields
    .filter(({ array, freeze }) => array && !freeze)
    .reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}: [DateTime!]`);
      return prev;
    }, entityTypeArray);

  booleanFields
    .filter(({ array, freeze }) => array && !freeze)
    .reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}: [Boolean!]`);
      return prev;
    }, entityTypeArray);

  enumFields
    .filter(({ array, freeze }) => array && !freeze)
    .reduce((prev, { enumName, name: name2 }) => {
      prev.push(`  ${name2}: [${enumName}Enumeration!]`);
      return prev;
    }, entityTypeArray);

  relationalFields
    .filter(({ array, freeze, parent }) => !parent && array && !freeze)
    .reduce((prev, { name: name2, config: config2, config: { name: relationalEntityName } }) => {
      prev.push(`  ${name2}: ${relationalEntityName}CreateOrPushChildrenInput`);

      childChain[`${relationalEntityName}CreateInput`] = [createEntityCreateInputType, config2];

      return prev;
    }, entityTypeArray);

  duplexFields
    .filter(({ array, freeze }) => array && !freeze)
    .reduce((prev, { name: name2, config: config2, config: { name: relationalEntityName } }) => {
      prev.push(`  ${name2}: ${relationalEntityName}CreateOrPushChildrenInput`);

      childChain[`${relationalEntityName}CreateInput`] = [createEntityCreateInputType, config2];

      return prev;
    }, entityTypeArray);

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

  embeddedFields
    .filter(({ array, freeze }) => array && !freeze)
    .reduce((prev, { name: name2, config: config2, config: { name: embeddedName } }) => {
      prev.push(`  ${name2}: [${embeddedName}CreateInput!]`);

      childChain[`${embeddedName}CreateInput`] = [createEntityCreateInputType, config2];

      return prev;
    }, entityTypeArray);

  geospatialFields
    .filter(({ array, freeze }) => array && !freeze)
    .reduce((prev, { name: name2, geospatialType }) => {
      prev.push(`  ${name2}: [Geospatial${geospatialType}Input!]`);
      return prev;
    }, entityTypeArray);

  if (entityTypeArray.length === 0) return [inputName, '', {}];

  entityTypeArray.unshift(`input PushInto${name}Input {`);
  entityTypeArray.push('}');

  const inputDefinition = entityTypeArray.join('\n');

  return [inputName, inputDefinition, childChain];
};

export default createPushIntoEntityInputType;
