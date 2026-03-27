import type { GeneralConfig } from '@/tsTypes';

const composeGeospatialTypes = (generalConfig: GeneralConfig): string => {
  const { allEntityConfigs } = generalConfig;
  let thereIsGeospatialPoint = false;
  let thereIsGeospatialLineString = false;
  let thereIsGeospatialMultiLineString = false;
  let thereIsGeospatialPolygon = false;
  let thereIsGeospatialMultiPolygon = false;

  const allEntityConfigsArray = Object.keys(allEntityConfigs).map(
    (entityName) => allEntityConfigs[entityName],
  );

  for (let i = 0; i < allEntityConfigsArray.length; i += 1) {
    const entityConfig = allEntityConfigsArray[i];
    const { geospatialFields = [] } = entityConfig;

    geospatialFields.forEach(({ geospatialType }) => {
      switch (geospatialType) {
        case 'Point':
          thereIsGeospatialPoint = true;
          break;
        case 'LineString':
          thereIsGeospatialLineString = true;
          break;
        case 'MultiLineString':
          thereIsGeospatialMultiLineString = true;
          break;
        case 'Polygon':
          thereIsGeospatialPolygon = true;
          break;
        case 'MultiPolygon':
          thereIsGeospatialMultiPolygon = true;
          break;

        default:
          throw new TypeError(`Incorrect "geospatialType": ${geospatialType}!`);
      }
    });

    if (thereIsGeospatialMultiLineString && thereIsGeospatialMultiPolygon) {
      break;
    }
  }

  if (
    !(
      thereIsGeospatialPoint ||
      thereIsGeospatialLineString ||
      thereIsGeospatialMultiLineString ||
      thereIsGeospatialPolygon ||
      thereIsGeospatialMultiPolygon
    )
  ) {
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
input GeospatialLineStringInput {
  coordinates: [GeospatialPointInput!]!
}
input GeospatialLineStringCorridorInput {
  coordinates: [GeospatialPointInput!]!
  distance: Float!
}
input GeospatialMultiLineStringCorridorInput {
  lineStrings: [GeospatialLineStringInput!]!
  distance: Float!
}
input GeospatialSphereInput {
  center: GeospatialPointInput!
  radius: Float!
}
input GeospatialPolygonRingInput {
  ring: [GeospatialPointInput!]!
}
input GeospatialPolygonInput {
  externalRing: GeospatialPolygonRingInput!
  internalRings: [GeospatialPolygonRingInput!]
}
input GeospatialMultiPolygonInput {
  polygons: [GeospatialPolygonInput!]!
}${
    thereIsGeospatialPolygon || thereIsGeospatialMultiPolygon
      ? `
type GeospatialPolygonRing {
  ring: [GeospatialPoint!]!
}
type GeospatialPolygon {
  externalRing: GeospatialPolygonRing!
  internalRings: [GeospatialPolygonRing!]
}${
          thereIsGeospatialMultiPolygon
            ? `
type GeospatialMultiPolygon {
  polygons: [GeospatialPolygon!]!
}`
            : ''
        }`
      : ''
  }${
    thereIsGeospatialLineString || thereIsGeospatialMultiLineString
      ? `
type GeospatialLineString {
  coordinates: [GeospatialPoint!]!
}${
          thereIsGeospatialMultiLineString
            ? `
type GeospatialMultiLineString {
  lineStrings: [GeospatialLineString!]!
}`
            : ''
        }`
      : ''
  }`;
};

export default composeGeospatialTypes;
