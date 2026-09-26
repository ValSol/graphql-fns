import type { GeneralConfig } from '@/tsTypes';

// collect "geospatialType" of simple & calculated geospatial fields
const collectGeospatialTypes = (
  fieldsHolder: { geospatialFields?: any[]; calculatedFields?: any[] },
  result: string[],
) => {
  const { geospatialFields = [], calculatedFields = [] } = fieldsHolder;

  [
    ...geospatialFields,
    ...calculatedFields.filter(({ calculatedType }) => calculatedType === 'geospatialFields'),
  ].forEach(({ geospatialType }) => {
    result.push(geospatialType);
  });

  return result;
};

const composeGeospatialTypes = (generalConfig: GeneralConfig): string => {
  const { allEntityConfigs, representation = {} } = generalConfig;
  let thereIsGeospatialPoint = false;
  let thereIsGeospatialLineString = false;
  let thereIsGeospatialMultiLineString = false;
  let thereIsGeospatialPolygon = false;
  let thereIsGeospatialMultiPolygon = false;

  const geospatialTypes = Object.keys(allEntityConfigs).reduce<string[]>(
    (prev, entityName) => collectGeospatialTypes(allEntityConfigs[entityName], prev),
    [],
  );

  // representations can add geospatial fields by "addFields"
  Object.keys(representation).forEach((representationKey) => {
    const { addFields = {} } = representation[representationKey];

    Object.keys(addFields).forEach((entityName) => {
      collectGeospatialTypes(addFields[entityName], geospatialTypes);
    });
  });

  geospatialTypes.forEach((geospatialType) => {
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

  if (!(
    thereIsGeospatialPoint ||
    thereIsGeospatialLineString ||
    thereIsGeospatialMultiLineString ||
    thereIsGeospatialPolygon ||
    thereIsGeospatialMultiPolygon
  )) {
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
input GeospatialCircleApproximatedByPolygonInput {
  center: GeospatialPointInput!
  radius: Float!
  steps: Int
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
