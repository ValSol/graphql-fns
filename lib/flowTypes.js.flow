// @flow

export type MongodbGeospatialPoint = {|
  type: 'Point',
  coordinates: [number, number],
|};

export type MongodbGeospatialPolygon = {|
  type: 'Polygon',
  coordinates: Array<Array<[number, number]>>,
|};

export type GeospatialPoint = {|
  longitude: number,
  latitude: number,
|};

export type GeospatialPolygon = {
  externalRing: {| ring: Array<GeospatialPoint> |},
  internalRings?: Array<{ ring: Array<GeospatialPoint> }>,
};

type GeospatialField = {
  name: string,
  required?: boolean,
  type: 'Point' | 'Polygon',
  array?: boolean,
};

type EnumField = {
  name: string,
  array?: boolean,
  default?: string | Array<string>,
  index?: boolean,
  required?: boolean,
  enumName: string, // name to compose graphql types
};

type TextField = {
  name: string,
  array?: boolean,
  default?: string | Array<string>,
  index?: boolean,
  required?: boolean,
  unique?: boolean,
};

export type ThingConfig = {
  isEmbedded?: boolean,
  duplexFields?: Array<{
    name: string,
    array?: boolean,
    config: ThingConfig,
    index?: boolean,
    oppositeName: string,
    required?: boolean,
  }>,
  embeddedFields?: Array<{
    name: string,
    required?: boolean,
    array?: boolean,
    config: ThingConfig,
  }>,
  relationalFields?: Array<{
    name: string,
    array?: boolean,
    config: ThingConfig,
    index?: boolean,
    required?: boolean,
  }>,

  textFields?: Array<TextField>,
  // $FlowFixMe
  enumFields?: Array<EnumField>,
  geospatialFields?: Array<GeospatialField>,
  name: string,
  pagination?: boolean,
};

export type Enums = Array<{ name: string, enum: Array<string> }>;

export type GeneralConfig = { thingConfigs: Array<ThingConfig>, enums: Enums };

export type Periphery = Map<
  ThingConfig,
  {
    // as key using oppositeName
    [key: string]: {
      oppositeIds: Array<string>,
      array: boolean,
      name: string,
      oppositeConfig: ThingConfig,
    },
  },
>;

export type NearInput = {|
  geospatialField: string,
  coordinates: GeospatialPoint,
  maxDistance: number,
|};

export type NearMongodb = {
  [key: string]: {
    $nearSphere: {
      $geometry: MongodbGeospatialPoint,
      $maxDistance: number,
    },
  },
};
