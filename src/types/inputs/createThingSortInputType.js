// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingSortInputType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const sortableFieldTypes = ['textFields'];

  const fieldLines = sortableFieldTypes.reduce((prev, fieldTypesName) => {
    const fieldLinesPortion = thingConfig[fieldTypesName]
      ? thingConfig[fieldTypesName]
          .filter(({ array, index }) => !array && index)
          .map(
            ({ name: fieldName }) => `  ${fieldName}
  -${fieldName}`,
          )
      : [];

    return [...prev, ...fieldLinesPortion];
  }, []);

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
