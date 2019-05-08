// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingWhereOneInputType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const scalarFieldTypes = [
    { fieldTypeName: 'textFields', gqlType: 'ID' },
    { fieldTypeName: 'dateTimeFields', gqlType: 'DateTime' },
  ];

  const fieldLines = scalarFieldTypes.reduce((prev, { fieldTypeName, gqlType }) => {
    if (thingConfig[fieldTypeName]) {
      thingConfig[fieldTypeName]
        .filter(({ unique }) => unique)
        .forEach(({ name: name2 }) => prev.push(`  ${name2}: ${gqlType}`));
    }
    return prev;
  }, []);

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

module.exports = createThingWhereOneInputType;
