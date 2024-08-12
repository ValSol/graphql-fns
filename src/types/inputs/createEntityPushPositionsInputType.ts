import type { InputCreator } from '../../tsTypes';

const createEntityPushPositionsInputType: InputCreator = (entityConfig) => {
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

  const inputName = `${name}PushPositionsInput`;

  if (configType !== 'tangible') return [inputName, '', {}];

  const { duplexFields = [], relationalFields = [] } = entityConfig;

  const entityTypeArray: Array<string> = [];

  textFields
    .filter(({ array, freeze }) => array && !freeze)
    .reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}: [Int!]`);
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
      prev.push(`  ${name2}: [Int!]`);
      return prev;
    }, entityTypeArray);

  dateTimeFields
    .filter(({ array, freeze }) => array && !freeze)
    .reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}: [Int!]`);
      return prev;
    }, entityTypeArray);

  booleanFields
    .filter(({ array, freeze }) => array && !freeze)
    .reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}: [Int!]`);
      return prev;
    }, entityTypeArray);

  enumFields
    .filter(({ array, freeze }) => array && !freeze)
    .reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}: [Int!]`);
      return prev;
    }, entityTypeArray);

  relationalFields
    .filter(({ array, freeze, parent }) => !parent && array && !freeze)
    .reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}: [Int!]`);

      return prev;
    }, entityTypeArray);

  duplexFields
    .filter(({ array, freeze }) => array && !freeze)
    .reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}: [Int!]`);

      return prev;
    }, entityTypeArray);

  embeddedFields
    .filter(({ array, freeze }) => array && !freeze)
    .reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}: [Int!]`);

      return prev;
    }, entityTypeArray);

  geospatialFields
    .filter(({ array, freeze }) => array && !freeze)
    .reduce((prev, { name: name2 }) => {
      prev.push(`  ${name2}: [Int!]`);
      return prev;
    }, entityTypeArray);

  if (entityTypeArray.length === 0) return [inputName, '', {}];

  entityTypeArray.unshift(`input ${name}PushPositionsInput {`);
  entityTypeArray.push('}');

  const inputDefinition = entityTypeArray.join('\n');

  return [inputName, inputDefinition, {}];
};

export default createEntityPushPositionsInputType;
