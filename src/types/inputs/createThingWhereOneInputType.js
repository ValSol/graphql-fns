// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingWhereOneInputType = (thingConfig: ThingConfig): string => {
  const { dateTimeFields, floatFields, intFields, name, textFields } = thingConfig;

  const fieldLines = [];

  if (textFields) {
    textFields.reduce((prev, { name: name2, unique }) => {
      if (unique) prev.push(`  ${name2}: ID`);
      return prev;
    }, fieldLines);
  }

  if (intFields) {
    intFields.reduce((prev, { name: name2, unique }) => {
      if (unique) prev.push(`  ${name2}: Int`);
      return prev;
    }, fieldLines);
  }

  if (floatFields) {
    floatFields.reduce((prev, { name: name2, unique }) => {
      if (unique) prev.push(`  ${name2}: Float`);
      return prev;
    }, fieldLines);
  }

  if (dateTimeFields) {
    dateTimeFields.reduce((prev, { name: name2, unique }) => {
      if (unique) prev.push(`  ${name2}: DateTime`);
      return prev;
    }, fieldLines);
  }

  const uniqueFields = fieldLines.join('\n');

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

export default createThingWhereOneInputType;
