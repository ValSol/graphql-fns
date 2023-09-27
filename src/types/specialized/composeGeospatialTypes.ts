import type { GeneralConfig } from '../../tsTypes';

const composeGeospatialTypes = (generalConfig: GeneralConfig): string => {
  const { allEntityConfigs } = generalConfig;
  let thereIsGeospatialPoint = false;
  let thereIsGeospatialPolygon = false;

  const allEntityConfigsArray = Object.keys(allEntityConfigs).map(
    (entityName) => allEntityConfigs[entityName],
  );

  for (let i = 0; i < allEntityConfigsArray.length; i += 1) {
    const entityConfig = allEntityConfigsArray[i];
    const { geospatialFields } = entityConfig;
    if (
      geospatialFields &&
      geospatialFields.some(({ geospatialType }) => geospatialType === 'Point')
    ) {
      thereIsGeospatialPoint = true;
    }
    if (
      geospatialFields &&
      geospatialFields.some(({ geospatialType }) => geospatialType === 'Polygon')
    ) {
      thereIsGeospatialPolygon = true;
      break;
    }
  }

  if (!thereIsGeospatialPoint && !thereIsGeospatialPolygon) {
    return '';
  }

  return `type GeospatialPoint {
  lng: Float!
  lat: Float!
}
input GeospatialPointInput {
  lng: Float!
  lat: Float!
}
input GeospatialSphereInput {
  center: GeospatialPointInput!
  radius: Float!
}${
    thereIsGeospatialPolygon
      ? `
type GeospatialPolygonRing {
  ring: [GeospatialPoint!]!
}
type GeospatialPolygon {
  externalRing: GeospatialPolygonRing!
  internalRings: [GeospatialPolygonRing!]
}
input GeospatialPolygonRingInput {
  ring: [GeospatialPointInput!]!
}
input GeospatialPolygonInput {
  externalRing: GeospatialPolygonRingInput!
  internalRings: [GeospatialPolygonRingInput!]
}`
      : ''
  }`;
};

export default composeGeospatialTypes;
