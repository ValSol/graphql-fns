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

type BooleanField = {
  name: string,
  array?: boolean,
  default?: boolean | Array<boolean>,
  index?: boolean,
  required?: boolean,
};

type EnumField = {
  name: string,
  array?: boolean,
  default?: string | Array<string>,
  index?: boolean,
  required?: boolean,
  enumName: string, // name to compose graphql types
};

type GeospatialField = {
  name: string,
  required?: boolean,
  geospatialType: 'Point' | 'Polygon',
  array?: boolean,
};

type ScalarInterfaceField = {
  array?: boolean,
  index?: boolean,
  required?: boolean,
  unique?: boolean,
};

type TextField = {
  ...ScalarInterfaceField,
  name: string,
  default?: string | Array<string>,
};

type DateTimeField = {
  ...ScalarInterfaceField,
  name: string,
  default?: Date | Array<Date>,
};

type IntField = {
  ...ScalarInterfaceField,
  name: string,
  default?: number | Array<number>,
};

type FloatField = {
  ...ScalarInterfaceField,
  name: string,
  default?: number | Array<number>,
};

export type FormField = {
  name: string,
  formFieldType?: 'hidden' | 'disabled' | 'email' | 'multiline',
  value?: any,
};

export type ThingConfig = {
  name: string,
  embedded?: boolean,
  pagination?: boolean,

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

  booleanFields?: Array<BooleanField>,
  dateTimeFields?: Array<DateTimeField>,
  enumFields?: Array<EnumField>,
  geospatialFields?: Array<GeospatialField>,
  intFields?: Array<IntField>,
  floatFields?: Array<FloatField>,
  textFields?: Array<TextField>,

  form?: Array<FormField>,
};

export type Enums = Array<{ name: string, enum: Array<string> }>;

type thingNamesList = null | Array<string>;

type InverntoryOptions = {
  Query?: null | {
    thing?: thingNamesList,
    things?: thingNamesList,
  },
  Mutation?: null | {
    createThing?: thingNamesList,
    updateThing?: thingNamesList,
    deleteThing?: thingNamesList,
  },
  Subscription?: null | {
    newThing?: thingNamesList,
  },
};
export type Inventory = {
  include?: null | InverntoryOptions,
  exclude?: null | InverntoryOptions,
};

export type GeneralConfig = {
  thingConfigs: Array<ThingConfig>,
  enums?: Enums,
  inventory?: Inventory,
};

type OneSegmentInventoryChain = ['Query'] | ['Mutation'] | ['Subscription'];
type TwoSegmentInventoryChain =
  | ['Query', 'thing' | 'things']
  | ['Mutation', 'createThing' | 'updateThing' | 'deleteThing']
  | ['Subscription', 'newThing'];
type ThreeSegmentInventoryChain =
  | ['Query', 'thing' | 'things', string]
  | ['Mutation', 'createThing' | 'updateThing' | 'deleteThing', string]
  | ['Subscription', 'newThing' | 'updatedThing' | 'deletedThing', string];
export type InventoryСhain =
  | OneSegmentInventoryChain
  | TwoSegmentInventoryChain
  | ThreeSegmentInventoryChain;

export type Periphery = Map<
  ThingConfig,
  {
    [oppositeName: string]: {
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
  // as key using [fieldName].coordinates
  [key: string]: {
    $nearSphere: {
      $geometry: MongodbGeospatialPoint,
      $maxDistance: number,
    },
  },
};

export type Subscribe = {
  subscribe: (_: Object, { name: string }, { pubsub: Object }) => Object,
};

export type ClientOptions = {
  depth?: number,
  include?: Object,
  exclude?: Object,
};

export type ClientFieldsOptions = {
  ...ClientOptions,
  shift: number,
};
