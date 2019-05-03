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

type TextField = {
  name: string,
  array?: boolean,
  default?: string | Array<string>,
  index?: boolean,
  required?: boolean,
  unique?: boolean,
};

type GeospatialField =
  | {
      name: string,
      default?: GeospatialPoint,
      required?: boolean,
      type: 'Point',
      array?: boolean,
    }
  | {
      name: string,
      default?: GeospatialPolygon,
      required?: boolean,
      type: 'Polygon',
      array?: boolean,
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
  geospatialFields?: Array<GeospatialField>,
  name: string,
  pagination?: boolean,
};

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
