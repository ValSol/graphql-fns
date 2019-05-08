//  @flow

import type { ThingConfig } from '../../flowTypes';

const createThingSortInputType = (thingConfig: ThingConfig): string => {
  const { enumFields, name } = thingConfig;

  const fieldLines = enumFields
    ? enumFields
        .filter(({ array, index }) => !array && index)
        .map(
          ({ name: fieldName }) => `  ${fieldName}_ASC
  ${fieldName}_DESC`,
        )
    : [];

  const scalarFieldTypes = ['textFields'];

  scalarFieldTypes.reduce((prev, fieldTypesName) => {
    const fieldLinesPortion = thingConfig[fieldTypesName]
      ? thingConfig[fieldTypesName]
          .filter(({ array, index }) => !array && index)
          .map(
            ({ name: fieldName }) => `  ${fieldName}_ASC
  ${fieldName}_DESC`,
          )
      : [];

    prev.push.apply(prev, fieldLinesPortion); // eslint-disable-line prefer-spread
    return prev;
  }, fieldLines);

  if (!fieldLines.length) return '';

  return `
enum ${name}SortEnumeration {
${fieldLines.join('\n')}
}
input ${name}SortInput {
  sortBy: [${name}SortEnumeration]
}`;
};

module.exports = createThingSortInputType;
