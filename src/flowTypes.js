// @flow

export type MongodbGeospatialPoint = {|
  +type: 'Point',
  +coordinates: [number, number],
|};

export type MongodbGeospatialPolygon = {|
  +type: 'Polygon',
  +coordinates: $ReadOnlyArray<$ReadOnlyArray<[number, number]>>,
|};

export type GeospatialPoint = {|
  +lng: number,
  +lat: number,
|};

export type GeospatialPolygon = {
  +externalRing: {| ring: $ReadOnlyArray<GeospatialPoint> |},
  +internalRings?: $ReadOnlyArray<{ +ring: $ReadOnlyArray<GeospatialPoint> }>,
};

type BooleanField =
  | {|
      +name: string,
      +array?: false,
      +default?: boolean,
      +index?: boolean,
      +required?: boolean,
    |}
  | {|
      +name: string,
      +array: true,
      +default?: $ReadOnlyArray<boolean>,
      +index?: boolean,
      +required?: boolean,
    |};

type EnumField =
  | {|
      +name: string,
      +array?: false,
      +default?: string,
      +index?: boolean,
      +required?: boolean,
      +enumName: string, // name to compose graphql types
    |}
  | {|
      +name: string,
      +array: true,
      +default?: $ReadOnlyArray<string>,
      +index?: boolean,
      +required?: boolean,
      +enumName: string, // name to compose graphql types
    |};

type GeospatialField = {|
  +name: string,
  +required?: boolean,
  +geospatialType: 'Point' | 'Polygon',
  +array?: boolean,
|};

type TextField =
  | {|
      +array?: false,
      +index?: boolean,
      +required?: boolean,
      +unique?: boolean,
      +name: string,
      +default?: string,
    |}
  | {|
      +array: true,
      +index?: boolean,
      +required?: boolean,
      +unique?: boolean,
      +name: string,
      +default?: $ReadOnlyArray<string>,
    |};

type DateTimeField =
  | {|
      +array?: false,
      +index?: boolean,
      +required?: boolean,
      +unique?: boolean,
      +name: string,
      +default?: Date,
    |}
  | {|
      +array: true,
      +index?: boolean,
      +required?: boolean,
      +unique?: boolean,
      +name: string,
      +default?: $ReadOnlyArray<Date>,
    |};

type IntField =
  | {|
      +array?: false,
      +index?: boolean,
      +required?: boolean,
      +unique?: boolean,
      +name: string,
      +default?: number,
    |}
  | {|
      +array: true,
      +index?: boolean,
      +required?: boolean,
      +unique?: boolean,
      +name: string,
      +default?: $ReadOnlyArray<number>,
    |};

type FloatField =
  | {|
      +array?: false,
      +index?: boolean,
      +required?: boolean,
      +unique?: boolean,
      +name: string,
      +default?: number,
    |}
  | {|
      +array: true,
      +index?: boolean,
      +required?: boolean,
      +unique?: boolean,
      +name: string,
      +default?: $ReadOnlyArray<number>,
    |};

export type FormField = {|
  +name: string,
  +formFieldType?: 'hidden' | 'disabled' | 'email' | 'multiline',
|};

export type ListColumn = {|
  +name: string,
  +width: number, // pixels
|};

export type ThingConfig = {
  name: string,
  embedded?: boolean,
  pagination?: boolean,

  duplexFields?: $ReadOnlyArray<{
    +name: string,
    +array?: boolean,
    +config: ThingConfig,
    +index?: boolean,
    +oppositeName: string,
    +required?: boolean,
  }>,
  embeddedFields?: $ReadOnlyArray<{
    +name: string,
    +required?: boolean,
    +array?: boolean,
    +config: ThingConfig,
  }>,
  relationalFields?: $ReadOnlyArray<{
    +name: string,
    +array?: boolean,
    +config: ThingConfig,
    +index?: boolean,
    +required?: boolean,
  }>,

  booleanFields?: $ReadOnlyArray<BooleanField>,
  dateTimeFields?: $ReadOnlyArray<DateTimeField>,
  enumFields?: $ReadOnlyArray<EnumField>,
  geospatialFields?: $ReadOnlyArray<GeospatialField>,
  intFields?: $ReadOnlyArray<IntField>,
  floatFields?: $ReadOnlyArray<FloatField>,
  textFields?: $ReadOnlyArray<TextField>,

  search?: $ReadOnlyArray<string>, // array of search field names
  form?: $ReadOnlyArray<FormField>,
  list?: $ReadOnlyArray<ListColumn>,
};

type DuplexField = {|
  +name: string,
  +array?: boolean,
  +config: ThingConfig,
  +index?: boolean,
  +oppositeName: string,
  +required?: boolean,
|};

type EmbeddedField = {|
  +name: string,
  +required?: boolean,
  +array?: boolean,
  +config: ThingConfig,
|};

type RelationalField = {|
  +name: string,
  +array?: boolean,
  +config: ThingConfig,
  +index?: boolean,
  +required?: boolean,
|};

export type FlatField =
  | RelationalField
  | DuplexField
  | TextField
  | FloatField
  | IntField
  | GeospatialField
  | EnumField
  | DateTimeField
  | BooleanField;

export type OrdinaryFieldObject =
  | {|
      +kind: 'booleanFields',
      +attributes: BooleanField,
    |}
  | {|
      +kind: 'dateTimeFields',
      +attributes: DateTimeField,
    |}
  | {
      +kind: 'duplexFields',
      +attributes: DuplexField,
    }
  | {|
      +kind: 'enumFields',
      +attributes: EnumField,
    |}
  | {|
      +kind: 'floatFields',
      +attributes: FloatField,
    |}
  | {|
      +kind: 'geospatialFields',
      +attributes: GeospatialField,
    |}
  | {|
      +kind: 'intFields',
      +attributes: IntField,
    |}
  | {|
      +kind: 'relationalFields',
      +attributes: RelationalField,
    |}
  | {|
      +kind: 'textFields',
      +attributes: TextField,
    |};

export type ThingConfigObject = {
  +[fieldName: string]:  // eslint-disable-line flowtype/space-after-type-colon
    | OrdinaryFieldObject
    | {|
        +kind: 'embeddedFields',
        +attributes: EmbeddedField,
      |},
};

// eslint-disable-next-line flowtype/generic-spacing
export type FlatFormikFields = $ReadOnlyArray<
  | OrdinaryFieldObject
  | {|
      +kind: 'embeddedFields',
      +attributes: EmbeddedField,
      +child: FlatFormikFields,
    |},
>;

export type Enums = $ReadOnlyArray<{|
  +name: string,
  +enum: $ReadOnlyArray<string>,
|}>;

type thingNamesList = null | $ReadOnlyArray<string>;

type InverntoryOptions = {
  +Query?: null | {
    // 'queryName' may be: thing, things, thingCount, or any custom query names
    +[queryName: string]: thingNamesList,
  },
  +Mutation?: null | {
    // 'mutationName' may be: createManyThings, createThing, updateThing, deleteThing or any custom mutation names
    +[mutationName: string]: thingNamesList,
  },
  +Subscription?: null | {
    +createdThing?: thingNamesList,
    +updatedThing?: thingNamesList,
    +deletedThing?: thingNamesList,
  },
};

export type Inventory = {
  +include?: null | InverntoryOptions,
  +exclude?: null | InverntoryOptions,
};

export type GeneralConfig = {
  +thingConfigs: $ReadOnlyArray<ThingConfig>,
  +custom?: {
    +Query?: {
      +[customQueryName: string]: {
        +name: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => string,
        +argNames: (
          thingConfig: ThingConfig,
          generalConfig: GeneralConfig,
        ) => $ReadOnlyArray<string>,
        +argTypes: (
          thingConfig: ThingConfig,
          generalConfig: GeneralConfig,
        ) => $ReadOnlyArray<string>,
        +type: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => string,
      },
    },
    +Mutation?: {
      +[customMutationName: string]: {
        +name: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => string,
        +argNames: (
          thingConfig: ThingConfig,
          generalConfig: GeneralConfig,
        ) => $ReadOnlyArray<string>,
        +argTypes: (
          thingConfig: ThingConfig,
          generalConfig: GeneralConfig,
        ) => $ReadOnlyArray<string>,
        +type: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => string,
      },
    },
  },
  +enums?: Enums,
  inventory?: Inventory,
};

// equal to previous code of 'custom' property
export type Custom = {
  +Query?: {
    +[customQueryName: string]: {
      +name: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => string,
      +argNames: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => $ReadOnlyArray<string>,
      +argTypes: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => $ReadOnlyArray<string>,
      +type: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => string,
    },
  },
  +Mutation?: {
    +[customMutationName: string]: {
      +name: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => string,
      +argNames: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => $ReadOnlyArray<string>,
      +argTypes: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => $ReadOnlyArray<string>,
      +type: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => string,
    },
  },
};

export type SignatureMethods = {
  // the same code as used above in GeneralConfig
  +name: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => string,
  +argNames: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => $ReadOnlyArray<string>,
  +argTypes: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => $ReadOnlyArray<string>,
  +type: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => string,
};

export type ServersideConfig = {
  +Query?: {
    +[customQueryName: string]: (
      thingConfig: ThingConfig,
      generalConfig: GeneralConfig,
    ) => Function,
  },
  +Mutation?: {
    +[customMutationName: string]: (
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
export type ThreeSegmentInventoryChain =
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
    [oppositeName: string]: {|
      +oppositeIds: Array<string>,
      +array: boolean,
      +name: string,
      +oppositeConfig: ThingConfig,
    |},
  },
>;

export type NearInput = {|
  +geospatialField: string,
  +coordinates: GeospatialPoint,
  +maxDistance: number,
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
  +depth?: number,
  +include?: Object,
  +exclude?: Object,
  // custom mutation, query or subscription attributes
  // 1st string - argName, 2nd - prefix of argType, 3d - suffix of argType
  +name?: string,
  +args?: $ReadOnlyArray<[string, string, string]>,
};

export type ClientFieldsOptions = {
  ...ClientOptions,
  shift: number,
};

export type RouterQuery = { create?: '', delete?: '', id?: string, thing: string };
