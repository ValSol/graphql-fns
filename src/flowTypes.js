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
};

export type ListColumn = {
  name: string,
  width: number, // pixels
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

  search?: Array<string>, // array of search field names
  form?: Array<FormField>,
  list?: Array<ListColumn>,
};

type DuplexField = {
  name: string,
  array?: boolean,
  config: ThingConfig,
  index?: boolean,
  oppositeName: string,
  required?: boolean,
};

type EmbeddedField = {
  name: string,
  required?: boolean,
  array?: boolean,
  config: ThingConfig,
};

type RelationalField = {
  name: string,
  array?: boolean,
  config: ThingConfig,
  index?: boolean,
  required?: boolean,
};

export type ThingConfigObject = {
  [fieldName: string]: {
    [property: string]: any,
    name: string,
    kind:  // eslint-disable-line flowtype/space-after-type-colon
      | 'booleanFields'
      | 'dateTimeFields'
      | 'duplexFields'
      | 'embeddedFields'
      | 'enumFields'
      | 'floatFields'
      | 'geospatialFields'
      | 'intFields'
      | 'relationalFields'
      | 'textFields',
  },
};

export type FlatFormikFields = Array<{
  attributes:  // eslint-disable-line flowtype/space-after-type-colon
    | BooleanField
    | DateTimeField
    | DuplexField
    | EmbeddedField
    | EnumField
    | FloatField
    | GeospatialField
    | IntField
    | RelationalField
    | TextField,
  child?: FlatFormikFields,
  kind:  // eslint-disable-line flowtype/space-after-type-colon
    | 'booleanFields'
    | 'dateTimeFields'
    | 'duplexFields'
    | 'embeddedFields'
    | 'enumFields'
    | 'floatFields'
    | 'geospatialFields'
    | 'intFields'
    | 'relationalFields'
    | 'textFields',
}>;

export type Enums = Array<{ name: string, enum: Array<string> }>;

type thingNamesList = null | Array<string>;

type InverntoryOptions = {
  Query?: null | {
    // 'queryName' may be: thing, things, thingCount, or any custom query names
    [queryName: string]: thingNamesList,
  },
  Mutation?: null | {
    // 'mutationName' may be: createManyThings, createThing, updateThing, deleteThing or any custom mutation names
    [mutationName: string]: thingNamesList,
  },
  Subscription?: null | {
    createdThing?: thingNamesList,
    updatedThing?: thingNamesList,
    deletedThing?: thingNamesList,
  },
};
export type Inventory = {
  include?: null | InverntoryOptions,
  exclude?: null | InverntoryOptions,
};

export type GeneralConfig = {
  thingConfigs: Array<ThingConfig>,
  custom?: {
    Query?: {
      [customQueryName: string]: {
        name: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => string,
        argNames: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => Array<string>,
        argTypes: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => Array<string>,
        type: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => string,
      },
    },
    Mutation?: {
      [customMutationName: string]: {
        name: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => string,
        argNames: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => Array<string>,
        argTypes: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => Array<string>,
        type: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => string,
      },
    },
  },
  enums?: Enums,
  inventory?: Inventory,
};

export type SignatureMethods = {
  // the same code as used above in GeneralConfig
  name: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => string,
  argNames: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => Array<string>,
  argTypes: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => Array<string>,
  type: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => string,
};

export type ServersideConfig = {
  Query?: {
    [customQueryName: string]: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => Function,
  },
  Mutation?: {
    [customMutationName: string]: (
      thingConfig: ThingConfig,
      generalConfig: GeneralConfig,
    ) => Function,
  },
};

type OneSegmentInventoryChain = ['Query'] | ['Mutation'] | ['Subscription'];
export type TwoSegmentInventoryChain =
  | ['Query', string] // "string" for 'thing', 'things', 'thingCount' or custom query
  | ['Mutation', string] // "string" for 'createThing', 'createManyThings', 'updateThing', 'deleteThing' or custom mutation
  | ['Subscription', 'createdThing' | 'updatedThing' | 'deletedThing'];
type ThreeSegmentInventoryChain =
  | ['Query', string, string] // first "string" for 'thing', 'things', 'thingCount' or custom query, second for thing name
  | [
      'Mutation',
      string, // "string" for 'createThing', 'createManyThings', 'updateThing', 'deleteThing' or custom mutation
      string, //  second "string" for thing name
    ]
  | ['Subscription', 'createdThing' | 'updatedThing' | 'deletedThing', string]; //  "string" for thing name

export type InventoryСhain =
  | OneSegmentInventoryChain
  | TwoSegmentInventoryChain
  | ThreeSegmentInventoryChain;

// eslint-disable-next-line flowtype/generic-spacing
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
  // custom mutation, query or subscription attributes
  // 1st string - argName, 2nd - prefix of argType, 3d - suffix of argType
  name?: string,
  args?: Array<[string, string, string]>,
};

export type ClientFieldsOptions = {
  ...ClientOptions,
  shift: number,
};

export type RouterQuery = { create?: '', delete?: '', id?: string, thing: string };
