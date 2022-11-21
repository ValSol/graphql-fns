// @flow

import type { InputCreator } from '../../flowTypes';

const createThingNearInputType: InputCreator = (thingConfig) => {
  const { name, geospatialFields } = thingConfig;

  const inputName = `${name}NearInput`;

  const fieldLines = geospatialFields
    ? geospatialFields
        // for 'near' query will use only scalar points
        .filter(({ array, geospatialType }) => !array && geospatialType === 'Point')
        .map(({ name: fieldName }) => `  ${fieldName}`)
    : {};

  const inputDefinition = fieldLines.length
    ? `enum ${name}GeospatialFieldNamesEnum {
${fieldLines.join('\n')}
}
input ${name}NearInput {
  geospatialField: ${name}GeospatialFieldNamesEnum!
  coordinates: GeospatialPointInput!
  maxDistance: Float
  minDistance: Float
}`
    : '';

  return [inputName, inputDefinition, {}];
};

export default createThingNearInputType;
