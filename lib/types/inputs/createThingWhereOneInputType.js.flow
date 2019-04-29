// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingWhereOneInputType = (thingConfig: ThingConfig): string => {
  const { name, textFields } = thingConfig;

  const uniqueFields = textFields
    ? textFields
        .filter(({ unique }) => unique)
        .map(({ name: fieldName }) => `  ${fieldName}: ID`)
        .join('\n')
    : '';

  if (uniqueFields) {
    return `input ${name}WhereOneInput {
  id: ID
${uniqueFields}
}`;
  }

  return `input ${name}WhereOneInput {
  id: ID!
}`;
};

module.exports = createThingWhereOneInputType;
