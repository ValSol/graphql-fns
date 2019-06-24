// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingNearInputType = (thingConfig: ThingConfig): string => {
  const { name, geospatialFields } = thingConfig;

  const fieldLines = geospatialFields
    ? geospatialFields
        // for 'near' query will use only scalar points
        .filter(({ array, geospatialType }) => !array && geospatialType === 'Point')
        .map(({ name: fieldName }) => `  ${fieldName}`)
    : [];

  if (!fieldLines.length) return '';

  return `enum ${name}GeospatialFieldNamesEnumeration {
${fieldLines.join('\n')}
}
input ${name}NearInput {
  geospatialField: ${name}GeospatialFieldNamesEnumeration
  coordinates: GeospatialPointInput
  maxDistance: Float
}`;
};

export default createThingNearInputType;
