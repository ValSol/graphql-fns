// @flow

import type { BitwiseArray } from 'bitwise-array/lib/flowTypes';

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

type SimplifiedDuplexField = {
  +name: string,
  +array?: boolean,
  +configName: string,
  +index?: boolean,
  +oppositeName: string,
  +required?: boolean,
  +unique?: boolean,
};

type SimplifiedEmbeddedField = {
  +name: string,
  +required?: boolean,
  +array?: boolean,
  +configName: string,
};

type SimplifiedFileField = {
  +name: string,
  +required?: boolean,
  +array?: boolean,
  +configName: string,
};

type SimplifiedRelationalField = {
  +name: string,
  +array?: boolean,
  +configName: string,
  +index?: boolean,
  +unique?: boolean,
  +required?: boolean,
};

export type SimplifiedThingConfig = {
  name: string,
  embedded?: boolean, // true if related to embeddedFields
  file?: boolean, // true if related to fileFields
  custom?: boolean, // may be used in custom queries & mutations to suppress id, createdAt & updatedAt auto-generation
  pagination?: boolean,

  duplexFields?: $ReadOnlyArray<SimplifiedDuplexField>,
  embeddedFields?: $ReadOnlyArray<SimplifiedEmbeddedField>,
  fileFields?: $ReadOnlyArray<SimplifiedFileField>,
  relationalFields?: $ReadOnlyArray<SimplifiedRelationalField>,

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

export type ThingConfig = {
  name: string,
  embedded?: boolean, // true if related to embeddedFields
  file?: boolean, // true if related to fileFields
  custom?: boolean, // may be used in custom queries & mutations to suppress id, createdAt & updatedAt auto-generation
  pagination?: boolean,

  duplexFields?: $ReadOnlyArray<{
    +name: string,
    +array?: boolean,
    +config: ThingConfig,
    +index?: boolean,
    +oppositeName: string,
    +required?: boolean,
    +unique?: boolean,
  }>,
  embeddedFields?: $ReadOnlyArray<{
    +name: string,
    +required?: boolean,
    +array?: boolean,
    +config: ThingConfig,
  }>,
  fileFields?: $ReadOnlyArray<{
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
    +unique?: boolean,
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
  +unique?: boolean,
|};

type EmbeddedField = {|
  +name: string,
  +required?: boolean,
  +array?: boolean,
  +config: ThingConfig,
|};

type FileField = {|
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
  +unique?: boolean,
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
      |}
    | {|
        +kind: 'fileFields',
        +attributes: FileField,
      |},
};

// eslint-disable-next-line flowtype/generic-spacing
export type FlatFormikFields = $ReadOnlyArray<
  | OrdinaryFieldObject
  | {|
      +kind: 'embeddedFields',
      +attributes: EmbeddedField,
      +child: FlatFormikFields,
    |}
  | {|
      +kind: 'fileFields',
      +attributes: FileField,
      +child: FlatFormikFields,
    |},
>;

export type Enums = $ReadOnlyArray<{|
  +name: string,
  +enum: $ReadOnlyArray<string>,
|}>;

type thingNamesList = true | $ReadOnlyArray<string>;

type InverntoryOptions = {
  // eslint-disable-next-line flowtype/space-after-type-colon
  +Query?:
    | true
    | {
        // 'queryName' may be: thing, things, thingCount, 'thingDistinctValues' or any custom query names
        +[queryName: string]: thingNamesList,
      },
  // eslint-disable-next-line flowtype/space-after-type-colon
  +Mutation?:
    | true
    | {
        // 'mutationName' may be: 'createThing', 'createManyThings', 'updateThing', 'deleteThing', ...
        // ... 'pushIntoThing', 'uploadFilesToThing' or custom mutation

        +[mutationName: string]: thingNamesList,
      },
  // eslint-disable-next-line flowtype/space-after-type-colon
  +Subscription?:
    | true
    | {
        +createdThing?: thingNamesList,
        +updatedThing?: thingNamesList,
        +deletedThing?: thingNamesList,
      },
};

export type Inventory = {
  +name: string,
  +include?: true | InverntoryOptions,
  +exclude?: true | InverntoryOptions,
};

type NotFieldyThingConfigFields = {
  name: string,
  embedded?: boolean,
  custom?: boolean,
  pagination?: boolean,
  search?: $ReadOnlyArray<string>,
  form?: $ReadOnlyArray<FormField>,
  list?: $ReadOnlyArray<ListColumn>,
};

export type GeneralConfig = {
  +thingConfigs: { [thingConfigName: string]: ThingConfig },
  +custom?: {
    +Input?: {
      +[customInputName: string]: {
        +name: string,
        +specificName: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => string,
        +fieldNames: (
          thingConfig: ThingConfig,
          generalConfig: GeneralConfig,
        ) => $ReadOnlyArray<string>,
        +fieldTypes: (
          thingConfig: ThingConfig,
          generalConfig: GeneralConfig,
        ) => $ReadOnlyArray<string>,
      },
    },
    +Query?: {
      +[customQueryName: string]: {
        +name: string,
        +specificName: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => string,
        +argNames: (
          thingConfig: ThingConfig,
          generalConfig: GeneralConfig,
        ) => $ReadOnlyArray<string>,
        +argTypes: (
          thingConfig: ThingConfig,
          generalConfig: GeneralConfig,
        ) => $ReadOnlyArray<string>,
        +type: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => string,
        +config: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => ThingConfig,
      },
    },
    +Mutation?: {
      +[customMutationName: string]: {
        +name: string,
        +specificName: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => string,
        +argNames: (
          thingConfig: ThingConfig,
          generalConfig: GeneralConfig,
        ) => $ReadOnlyArray<string>,
        +argTypes: (
          thingConfig: ThingConfig,
          generalConfig: GeneralConfig,
        ) => $ReadOnlyArray<string>,
        +type: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => string,
        +config: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => ThingConfig,
      },
    },
  },
  +derivative?: {
    // whole derivative name = thingName (baseName) + derivativeName
    +[derivativeName: string]: {
      +suffix: string,
      +allow: {
        // eslint-disable-next-line flowtype/generic-spacing
        [thingName: string]: Array<
          | 'thing'
          | 'things'
          | 'createThing'
          | 'createManyThings'
          | 'importThings'
          | 'pushIntoThing'
          | 'updateThing'
          | 'uploadFilesToThing',
        >,
      },
      +includeFields?: { [thingName: string]: Array<string> },
      +excludeFields?: { [thingName: string]: Array<string> },
      +addFields?: {
        [thingName: string]: $Diff<SimplifiedThingConfig, NotFieldyThingConfigFields>,
      },
      +derivativeFields?: { [thingName: string]: { [fieldName: string]: string } }, // set appropriate derivative suffixes
    },
  },
  +enums?: Enums,
  inventory?: Inventory,
};

export type ObjectSignatureMethods = {
  // the same code as used above in GeneralConfig for Input
  // when the name method return "" (empty string) => object will be rejected
  +name: string,
  +specificName: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => string,
  +fieldNames: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => $ReadOnlyArray<string>,
  +fieldTypes: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => $ReadOnlyArray<string>,
};

export type ActionSignatureMethods = {
  // the same code as used above in GeneralConfig for Query & Mutation
  // when the name method return "" (empty string) => action will be rejected
  +name: string,
  +specificName: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => string,
  +argNames: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => $ReadOnlyArray<string>,
  +argTypes: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => $ReadOnlyArray<string>,
  +type: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => string,
  +config: (thingConfig: ThingConfig, generalConfig: GeneralConfig) => ThingConfig,
};

// equal to previous code of 'custom' property
export type Custom = {
  +Input?: {
    +[customInputName: string]: ObjectSignatureMethods,
  },
  +Query?: {
    +[customQueryName: string]: ActionSignatureMethods,
  },
  +Mutation?: {
    +[customMutationName: string]: ActionSignatureMethods,
  },
};

export type DerivativeAttributes = {
  +suffix: string,
  +allow: {
    // eslint-disable-next-line flowtype/generic-spacing
    [thingName: string]: Array<
      | 'thing'
      | 'things'
      | 'createThing'
      | 'createManyThings'
      | 'importThings'
      | 'pushIntoThing'
      | 'updateThing'
      | 'uploadFilesToThing',
    >,
  },
  +includeFields?: { [thingName: string]: Array<string> },
  +excludeFields?: { [thingName: string]: Array<string> },
  +addFields?: {
    [thingName: string]: $Diff<SimplifiedThingConfig, NotFieldyThingConfigFields>,
  },
  +derivativeFields?: { [thingName: string]: { [fieldName: string]: string } }, // set appropriate derivative suffixes
};

type OneSegmentInventoryChain = ['Query'] | ['Mutation'] | ['Subscription'];
export type TwoSegmentInventoryChain =
  | ['Query', string] // "string" for 'thing', 'things', 'thingCount', 'thingDistinctValues', 'thingFile', 'thingFiles', 'thingFileCount' or custom query
  | [
      'Mutation',
      // "string" for 'createThing', 'createManyThings', 'updateThing', 'deleteThing', 'pushIntoThing', ...
      // ... 'uploadFilesToThing' or custom mutation
      string,
    ]
  | ['Subscription', 'createdThing' | 'updatedThing' | 'deletedThing'];
export type ThreeSegmentInventoryChain =
  | ['Query', string, string] // first "string" for 'thing', 'things', 'thingCount', 'thingDistinctValues', 'thingFile', 'thingFiles', 'thingFileCount' or custom query, second for thing name
  | [
      'Mutation',
      // "string" for 'createThing', 'createManyThings', 'updateThing', 'deleteThing', 'pushIntoThing', ...
      // ... 'uploadFilesToThing' or custom mutation
      string,
      string, //  second "string" for thing name
    ]
  | ['Subscription', 'createdThing' | 'updatedThing' | 'deletedThing', string]; //  "string" for thing name

export type InventoryСhain =
  | OneSegmentInventoryChain
  | TwoSegmentInventoryChain
  | ThreeSegmentInventoryChain;

export type InventoryByRoles = {
  // must be setted for all roles and plus for empty string ""
  [role: string]: Inventory,
};

export type FileAttributes = {
  _id?: string,
  hash: string,
  filename: string,
  mimetype: string,
  encoding: string,
  uploadedAt: Date,
};

export type ServersideConfig = {
  +Query?: {
    +[customQueryName: string]: (
      thingConfig: ThingConfig,
      generalConfig: GeneralConfig,
      serversideConfig: ServersideConfig,
    ) => Function,
  },
  +Mutation?: {
    +[customMutationName: string]: (
      thingConfig: ThingConfig,
      generalConfig: GeneralConfig,
      serversideConfig: ServersideConfig,
    ) => Function,
  },
  +returnScalar?: {
    +Query?: {
      +[customQueryName: string]: boolean,
    },
    +Mutation?: {
      +[customMutationName: string]: boolean,
    },
  },

  +inventoryByRoles?: InventoryByRoles, // "inventoryByRoles" & "getCredentials" are mutualy used
  +getCredentials?: (context: Object) => Promise<{ roles: Array<string> }>,
  +saveFiles?: {
    [fileFieldConfigName: string]: (
      file: Object,
      hash: string,
      date: Date,
    ) => Promise<FileAttributes>,
  },
  +composeFileFieldsData?: {
    [fileFieldConfigName: string]: (fileAttributes: FileAttributes) => Object,
  },
};

export type UploadOptions = {|
  targets: Array<string>, // fileFields names
  counts: Array<number>, // count of uploaded files for each fileField
  hashes: Array<string>, // hash of every uploaded file
|};

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
  +name?: string,
};

export type ClientFieldsOptions = {
  ...ClientOptions,
  shift: number,
};

export type RouterQuery = { create?: '', delete?: '', id?: string, thing: string };

export type BoleanVariant = { fieldVariant: 'booleanField', value: 'all' | boolean };
export type EnumVariant = {
  fieldVariant: 'enumField',
  value: 'all' | BitwiseArray,
  enumeration: Array<string>,
};
export type EnumArrayVariant = {
  fieldVariant: 'enumArrayField',
  value: 'all' | BitwiseArray,
  enumeration: Array<string>,
};
type FieldVariant = BoleanVariant | EnumVariant | EnumArrayVariant;
export type AdminFilters = { [fieldName: string]: FieldVariant };

export type AdminListContextState = {
  error: string,
  decorated: Array<Object>,
  items: Array<Object>,
  listItems: Array<Object>,
  filtered: Array<Object>,
  masks: { [fieldName: string]: BitwiseArray },
  loading: boolean,
  filters: AdminFilters,
  config: ThingConfig | null,
  outdated: boolean,
};
