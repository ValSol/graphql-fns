import type {GeneralConfig} from '../../tsTypes';

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

  if (thereIsGeospatialPolygon) {
    return `type GeospatialPoint {
  lng: Float!
  lat: Float!
}
type GeospatialPolygonRing {
  ring: [GeospatialPoint!]!
}
type GeospatialPolygon {
  externalRing: GeospatialPolygonRing!
  internalRings: [GeospatialPolygonRing!]
}
input GeospatialPointInput {
  lng: Float!
  lat: Float!
}
input GeospatialPolygonRingInput {
  ring: [GeospatialPointInput!]!
}
input GeospatialPolygonInput {
  externalRing: GeospatialPolygonRingInput!
  internalRings: [GeospatialPolygonRingInput!]
}`;
  }

  if (thereIsGeospatialPoint) {
    return `type GeospatialPoint {
  lng: Float!
  lat: Float!
}
input GeospatialPointInput {
  lng: Float!
  lat: Float!
}`;
  }

  return '';
};

export default composeGeospatialTypes;
