// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingNearInputType = (thingConfig: ThingConfig): string => {
  const { name, geospatialFields } = thingConfig;

  const fieldLines = geospatialFields
    ? geospatialFields.map(({ name: fieldName }) => `  ${fieldName}: GeospatialPointInput`)
    : [];

  if (!fieldLines.length) return '';

  fieldLines.push('  maxDistance: Float');

  return `
input ${name}NearInput {
${fieldLines.join('\n')}
}`;
};

module.exports = createThingNearInputType;
