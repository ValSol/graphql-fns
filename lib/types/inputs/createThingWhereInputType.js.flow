// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingWhereInputType = (thingConfig: ThingConfig): string => {
  const { name, textFields } = thingConfig;

  const indexedFields = textFields
    ? textFields
        .filter(({ index }) => index)
        .map(({ name: fieldName }) => `  ${fieldName}: String`)
        .join('\n')
    : '';
  const result =
    indexedFields &&
    `
input ${name}WhereInput {
${indexedFields}
}`;

  return result;
};

module.exports = createThingWhereInputType;
