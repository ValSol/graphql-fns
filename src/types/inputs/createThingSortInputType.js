//  @flow

import type { ThingConfig } from '../../flowTypes';

const createThingSortInputType = (thingConfig: ThingConfig): string => {
  const { booleanFields, enumFields, intFields, floatFields, textFields, name } = thingConfig;

  const fieldLines = enumFields
    ? enumFields
        .filter(({ array, index }) => !array && index)
        .map(
          ({ name: fieldName }) => `  ${fieldName}_ASC
  ${fieldName}_DESC`,
        )
    : [];

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

  if (!fieldLines.length) return '';

  return `enum ${name}SortEnum {
${fieldLines.join('\n')}
}
input ${name}SortInput {
  sortBy: [${name}SortEnum]
}`;
};

export default createThingSortInputType;
