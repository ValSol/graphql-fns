import type { InputCreator } from '../../tsTypes';

const createEntitySortInputType: InputCreator = (entityConfig) => {
  const { booleanFields, dateTimeFields, enumFields, intFields, floatFields, textFields, name } =
    entityConfig;

  const inputName = `${name}SortInput`;

  const fieldLines = [
    '  id_ASC',
    '  id_DESC',
    '  createdAt_ASC',
    '  createdAt_DESC',
    '  updatedAt_ASC',
    '  updatedAt_DESC',
  ];

  if (enumFields) {
    enumFields
      .filter(({ array, index }) => !array && index)
      .reduce((prev, { name: fieldName }) => {
        prev.push(`  ${fieldName}_ASC
  ${fieldName}_DESC`);
        return prev;
      }, fieldLines);
  }

  if (dateTimeFields) {
    dateTimeFields
      .filter(({ array, index }) => !array && index)
      .reduce((prev, { name: fieldName }) => {
        prev.push(`  ${fieldName}_ASC
  ${fieldName}_DESC`);
        return prev;
      }, fieldLines);
  }

  if (textFields) {
    textFields
      .filter(({ array, index }) => !array && index)
      .reduce((prev, { name: fieldName }) => {
        prev.push(`  ${fieldName}_ASC
  ${fieldName}_DESC`);
        return prev;
      }, fieldLines);
  }

  if (intFields) {
    intFields
      .filter(({ array, index }) => !array && index)
      .reduce((prev, { name: fieldName }) => {
        prev.push(`  ${fieldName}_ASC
  ${fieldName}_DESC`);
        return prev;
      }, fieldLines);
  }

  if (floatFields) {
    floatFields
      .filter(({ array, index }) => !array && index)
      .reduce((prev, { name: fieldName }) => {
        prev.push(`  ${fieldName}_ASC
  ${fieldName}_DESC`);
        return prev;
      }, fieldLines);
  }

  if (booleanFields) {
    booleanFields
      .filter(({ array, index }) => !array && index)
      .reduce((prev, { name: fieldName }) => {
        prev.push(`  ${fieldName}_ASC
  ${fieldName}_DESC`);
        return prev;
      }, fieldLines);
  }

  if (!fieldLines.length) return [inputName, '', {}];

  const inputDefinition = `enum ${name}SortEnum {
${fieldLines.join('\n')}
}
input ${name}SortInput {
  sortBy: [${name}SortEnum]
}`;

  return [inputName, inputDefinition, {}];
};

export default createEntitySortInputType;
