// @flow

import type { InputCreator } from '../../flowTypes';

const createEntityNearInputType: InputCreator = (entityConfig) => {
  const { name, geospatialFields } = entityConfig;

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

export default createEntityNearInputType;
