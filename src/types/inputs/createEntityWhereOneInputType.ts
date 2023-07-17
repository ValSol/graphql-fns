import type { InputCreator } from '../../tsTypes';

const createEntityWhereOneInputType: InputCreator = (entityConfig) => {
  const {
    dateTimeFields = [],
    floatFields = [],
    intFields = [],
    name,
    textFields = [],
    type: entityType,
  } = entityConfig;

  const inputName = `${name}WhereOneInput`;

  const fieldLines: Array<string> = [];

  textFields.reduce((prev, { name: name2, unique }) => {
    if (unique) prev.push(`  ${name2}: ID`);
    return prev;
  }, fieldLines);

  if (entityType === 'tangible') {
    const { duplexFields = [], relationalFields = [] } = entityConfig;

    duplexFields.reduce((prev, { name: name2, unique }) => {
      if (unique) prev.push(`  ${name2}: ID`);
      return prev;
    }, fieldLines);

    relationalFields.reduce((prev, { name: name2, unique, parent }) => {
      if (!parent && unique) prev.push(`  ${name2}: ID`);
      return prev;
    }, fieldLines);
  }

  intFields.reduce((prev, { name: name2, unique }) => {
    if (unique) prev.push(`  ${name2}: Int`);
    return prev;
  }, fieldLines);

  floatFields.reduce((prev, { name: name2, unique }) => {
    if (unique) prev.push(`  ${name2}: Float`);
    return prev;
  }, fieldLines);

  dateTimeFields.reduce((prev, { name: name2, unique }) => {
    if (unique) prev.push(`  ${name2}: DateTime`);
    return prev;
  }, fieldLines);

  if (fieldLines.length > 0) {
    fieldLines.unshift('  id: ID');
  } else {
    fieldLines.unshift('  id: ID!');
  }

  const inputDefinition = `input ${name}WhereOneInput {
${fieldLines.join('\n')}
}`;

  return [inputName, inputDefinition, {}];
};

export default createEntityWhereOneInputType;
