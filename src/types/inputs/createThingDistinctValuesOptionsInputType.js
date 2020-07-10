//  @flow
// COMEBACK

import type { ThingConfig } from '../../flowTypes';

const createThingDistinctValuesOptionsInputType = (thingConfig: ThingConfig): string => {
  const { textFields, name } = thingConfig;

  const fieldLines = textFields ? textFields.map(({ name: fieldName }) => `  ${fieldName}`) : [];

  if (!fieldLines.length) return '';

  return `enum ${name}TextNamesEnum {
${fieldLines.join('\n')}
}
input ${name}DistinctValuesOptionsInput {
  target: ${name}TextNamesEnum!
}`;
};

export default createThingDistinctValuesOptionsInputType;
