// @flow

import type { InputCreator } from '../../flowTypes';

const createThingWhereOneInputType: InputCreator = (thingConfig) => {
  const {
    dateTimeFields,
    duplexFields,
    floatFields,
    intFields,
    name,
    relationalFields,
    textFields,
  } = thingConfig;

  const inputName = `${name}WhereOneInput`;

  const fieldLines = [];

  if (textFields) {
    textFields.reduce((prev, { name: name2, unique }) => {
      if (unique) prev.push(`  ${name2}: ID`);
      return prev;
    }, fieldLines);
  }

  if (duplexFields) {
    duplexFields.reduce((prev, { name: name2, unique }) => {
      if (unique) prev.push(`  ${name2}: ID`);
      return prev;
    }, fieldLines);
  }

  if (relationalFields) {
    relationalFields.reduce((prev, { name: name2, unique }) => {
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

  if (fieldLines.length) {
    fieldLines.unshift('  id: ID');
  } else {
    fieldLines.unshift('  id: ID!');
  }

  const inputDefinition = `input ${name}WhereOneInput {
${fieldLines.join('\n')}
}`;

  return [inputName, inputDefinition, {}];
};

export default createThingWhereOneInputType;
