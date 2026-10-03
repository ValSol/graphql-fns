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

// these geospatial inputs are declared in any case (if there are geospatial fields) to be used by custom actions ...
// ... (see "commonInputTypes" in "fillInputDicForCustom"), the other types & inputs only if they are referenced
const commonGeospatialInputNames = [
  'GeospatialPointInput',
  'GeospatialPolygonRingInput',
  'GeospatialPolygonInput',
  'GeospatialMultiPolygonInput',
];

// "typeDefsToUse" - all other type definitions, if it is set exclude not referenced geospatial types & inputs
const excludeNotUsedDeclarations = (geospatialTypes: string, typeDefsToUse: string) => {
  const declarations = geospatialTypes.split(/\n(?=type |input )/);

  const nameOf = (declaration: string) => declaration.split(' ')[1];

  const isReferenced = (name: string, text: string) => new RegExp(`\\b${name}\\b`).test(text);

  const used = declarations.filter(
    (declaration) =>
      commonGeospatialInputNames.includes(nameOf(declaration)) ||
      isReferenced(nameOf(declaration), typeDefsToUse),
  );

  // add declarations referenced by other used ones (e.g. "GeospatialPoint" by "GeospatialPolygonRing")
  let changed = true;
  while (changed) {
    changed = false;

    const usedText = used.join('\n');

    declarations.forEach((declaration) => {
      if (!used.includes(declaration) && isReferenced(nameOf(declaration), usedText)) {
        used.push(declaration);
        changed = true;
      }
    });
  }

  return declarations.filter((declaration) => used.includes(declaration)).join('\n');
};

const composeGeospatialTypes = (generalConfig: GeneralConfig, typeDefsToUse?: string): string => {
  const { allEntityConfigs, representations = {} } = generalConfig;
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
  Object.keys(representations).forEach((representationKey) => {
    const { addFields = {} } = representations[representationKey];

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

  const geospatialTypeDefs = `type GeospatialPoint {
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
input GeospatialMultiLineStringInput {
  lineStrings: [GeospatialLineStringInput!]!
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

  return typeDefsToUse === undefined
    ? geospatialTypeDefs
    : excludeNotUsedDeclarations(geospatialTypeDefs, typeDefsToUse);
};

export default composeGeospatialTypes;
