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
      +freeze?: boolean,
      +index?: boolean,
      +required?: boolean,
    |}
  | {|
      +name: string,
      +array: true,
      +default?: $ReadOnlyArray<boolean>,
      +freeze?: boolean,
      +index?: boolean,
      +required?: boolean,
    |};

type EnumField =
  | {|
      +name: string,
      +array?: false,
      +default?: string,
      +freeze?: boolean,
      +index?: boolean,
      +required?: boolean,
      +enumName: string, // name to compose graphql types
    |}
  | {|
      +name: string,
      +array: true,
      +default?: $ReadOnlyArray<string>,
      +freeze?: boolean,
      +index?: boolean,
      +required?: boolean,
      +enumName: string, // name to compose graphql types
    |};

type GeospatialField = {|
  +name: string,
  +required?: boolean,
  +geospatialType: 'Point' | 'Polygon',
  +array?: boolean,
  +freeze?: boolean,
|};

type TextField =
  | {|
      +array?: false,
      +index?: boolean,
      +required?: boolean,
      +unique?: boolean,
      +name: string,
      +default?: string,
      +freeze?: boolean,
      +weight?: number,
    |}
  | {|
      +array: true,
      +index?: boolean,
      +required?: boolean,
      +unique?: boolean,
      +name: string,
      +default?: $ReadOnlyArray<string>,
      +freeze?: boolean,
      +weight?: number,
    |};

type DateTimeField =
  | {|
      +array?: false,
      +index?: boolean,
      +required?: boolean,
      +unique?: boolean,
      +name: string,
      +default?: Date,
      +freeze?: boolean,
    |}
  | {|
      +array: true,
      +index?: boolean,
      +required?: boolean,
      +unique?: boolean,
      +name: string,
      +default?: $ReadOnlyArray<Date>,
      +freeze?: boolean,
    |};

type IntField =
  | {|
      +array?: false,
      +index?: boolean,
      +required?: boolean,
      +unique?: boolean,
      +name: string,
      +default?: number,
      +freeze?: boolean,
    |}
  | {|
      +array: true,
      +index?: boolean,
      +required?: boolean,
      +unique?: boolean,
      +name: string,
      +default?: $ReadOnlyArray<number>,
      +freeze?: boolean,
    |};

type FloatField =
  | {|
      +array?: false,
      +index?: boolean,
      +required?: boolean,
      +unique?: boolean,
      +name: string,
      +default?: number,
      +freeze?: boolean,
    |}
  | {|
      +array: true,
      +index?: boolean,
      +required?: boolean,
      +unique?: boolean,
      +name: string,
      +default?: $ReadOnlyArray<number>,
      +freeze?: boolean,
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
  +freeze?: boolean,
  +parent?: boolean,
};

type SimplifiedEmbeddedField = {
  +name: string,
  +required?: boolean,
  +array?: boolean,
  +configName: string,
  +freeze?: boolean,
};

type SimplifiedFileField = {
  +name: string,
  +required?: boolean,
  +array?: boolean,
  +configName: string,
  +freeze?: boolean,
};

type SimplifiedRelationalField = {
  +name: string,
  +array?: boolean,
  +configName: string,
  +index?: boolean,
  +unique?: boolean,
  +required?: boolean,
  +freeze?: boolean,
};

type SimplifiedChildField = {
  +name: string,
  +required?: boolean,
  +array?: boolean,
  +configName: string,
  +required?: boolean,
};

export type SimplifiedEntityConfig = {
  name: string,
  derivativeNameSlicePosition?: number,
  type?: string, // 'embedded', 'file', 'tangible', 'tangibleFile', 'virtual',
  counter?: boolean, // if true entity has the 'counter' field

  duplexFields?: $ReadOnlyArray<SimplifiedDuplexField>,
  embeddedFields?: $ReadOnlyArray<SimplifiedEmbeddedField>,
  fileFields?: $ReadOnlyArray<SimplifiedFileField>,
  relationalFields?: $ReadOnlyArray<SimplifiedRelationalField>,
  childFields?: $ReadOnlyArray<SimplifiedChildField>,

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

export type EntityConfig = {
  name: string,
  derivativeNameSlicePosition?: number,
  type: string, // embedded, file, tangible (default), virtual,
  counter?: boolean, // if true entity has the 'counter' field

  duplexFields?: $ReadOnlyArray<{
    +name: string,
    +array?: boolean,
    +config: EntityConfig,
    +index?: boolean,
    +oppositeName: string,
    +required?: boolean,
    +unique?: boolean,
    +freeze?: boolean,
    +parent?: boolean,
  }>,

  embeddedFields?: $ReadOnlyArray<{
    +name: string,
    +required?: boolean,
    +array?: boolean,
    +config: EntityConfig,
    +freeze?: boolean,
  }>,

  fileFields?: $ReadOnlyArray<{
    +name: string,
    +required?: boolean,
    +array?: boolean,
    +config: EntityConfig,
    +freeze?: boolean,
  }>,

  relationalFields?: $ReadOnlyArray<{
    +name: string,
    +array?: boolean,
    +config: EntityConfig,
    +index?: boolean,
    +unique?: boolean,
    +required?: boolean,
    +freeze?: boolean,
  }>,

  childFields?: $ReadOnlyArray<{
    +name: string,
    +required?: boolean,
    +array?: boolean,
    +config: EntityConfig,
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

export type DuplexField = {|
  +name: string,
  +array?: boolean,
  +config: EntityConfig,
  +index?: boolean,
  +oppositeName: string,
  +required?: boolean,
  +unique?: boolean,
  +freeze?: boolean,
  +parent?: boolean,
|};

export type EmbeddedField = {|
  +name: string,
  +required?: boolean,
  +array?: boolean,
  +config: EntityConfig,
  +freeze?: boolean,
|};

export type FileField = {|
  +name: string,
  +required?: boolean,
  +array?: boolean,
  +config: EntityConfig,
  +freeze?: boolean,
|};

type RelationalField = {|
  +name: string,
  +array?: boolean,
  +config: EntityConfig,
  +index?: boolean,
  +required?: boolean,
  +unique?: boolean,
  +freeze?: boolean,
|};

type ChildField = {|
  +name: string,
  +array?: boolean,
  +config: EntityConfig,
  +required?: boolean,
|};

export type FlatField =
  | RelationalField
  | DuplexField
  | ChildField
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
      +kind: 'childFields',
      +attributes: ChildField,
    |}
  | {|
      +kind: 'textFields',
      +attributes: TextField,
    |};

export type EntityConfigObject = {
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

type entityNamesList = true | $ReadOnlyArray<string>;

type InverntoryOptions = {
  // eslint-disable-next-line flowtype/space-after-type-colon
  Query?:
    | true
    | {
        // 'queryName' may be: entity, entities, , 'entityDistinctValues' or any custom query names
        +[queryName: string]: entityNamesList,
      },
  // eslint-disable-next-line flowtype/space-after-type-colon
  Mutation?:
    | true
    | {
        // 'mutationName' may be: 'copyEntity', 'createEntity', 'createManyEntities', 'updateManyEntities', 'updateEntity', 'deleteEntity', ...
        // ... 'pushIntoEntity', or custom mutation

        +[mutationName: string]: entityNamesList,
      },
  // eslint-disable-next-line flowtype/space-after-type-colon
  Subscription?:
    | true
    | {
        +createdEntity?: entityNamesList,
        +updatedEntity?: entityNamesList,
        +deletedEntity?: entityNamesList,
      },
};

export type Inventory = {
  name: string,
  include?: true | InverntoryOptions,
  exclude?: true | InverntoryOptions,
};

type NotFieldyEntityConfigFields = {
  name: string,
  type?: string,
  counter?: boolean,
};

export type GeneralConfig = {
  +allEntityConfigs: { [entityConfigName: string]: EntityConfig },
  +custom?: {
    +Input?: {
      +[customInputName: string]: {
        +name: string,
        +specificName: (entityConfig: EntityConfig, generalConfig: GeneralConfig) => string,
        +fieldNames: (
          entityConfig: EntityConfig,
          generalConfig: GeneralConfig,
        ) => $ReadOnlyArray<string>,
        +fieldTypes: (
          entityConfig: EntityConfig,
          generalConfig: GeneralConfig,
        ) => $ReadOnlyArray<string>,
      },
    },
    +Query?: {
      +[customQueryName: string]: {
        +name: string,
        +specificName: (entityConfig: EntityConfig, generalConfig: GeneralConfig) => string,
        +argNames: (
          entityConfig: EntityConfig,
          generalConfig: GeneralConfig,
        ) => $ReadOnlyArray<string>,
        +argTypes: (
          entityConfig: EntityConfig,
          generalConfig: GeneralConfig,
        ) => $ReadOnlyArray<string>,
        +involvedEntityNames: (
          entityConfig: EntityConfig,
          generalConfig: GeneralConfig,
        ) => { [key: string]: string },
        +type: (entityConfig: EntityConfig, generalConfig: GeneralConfig) => string,
        +config: (entityConfig: EntityConfig, generalConfig: GeneralConfig) => null | EntityConfig,
      },
    },
    +Mutation?: {
      +[customMutationName: string]: {
        +name: string,
        +specificName: (entityConfig: EntityConfig, generalConfig: GeneralConfig) => string,
        +argNames: (
          entityConfig: EntityConfig,
          generalConfig: GeneralConfig,
        ) => $ReadOnlyArray<string>,
        +argTypes: (
          entityConfig: EntityConfig,
          generalConfig: GeneralConfig,
        ) => $ReadOnlyArray<string>,
        +involvedEntityNames: (
          entityConfig: EntityConfig,
          generalConfig: GeneralConfig,
        ) => { [key: string]: string },
        +type: (entityConfig: EntityConfig, generalConfig: GeneralConfig) => string,
        +config: (entityConfig: EntityConfig, generalConfig: GeneralConfig) => null | EntityConfig,
      },
    },
  },
  +derivative?: {
    // whole fefault derivative name = entityName (baseName) + derivativeKey
    // OR compose from derivativeNameSlicePosition entity config attribute (if it's setted)
    +[derivativeKey: string]: {
      +derivativeKey: string,
      +allow: {
        // eslint-disable-next-line flowtype/generic-spacing
        [entityName: string]: Array<
          | 'entity'
          | 'childEntity'
          | 'entityCount'
          | 'entityDistinctValues'
          | 'entities'
          | 'entitiesThroughConnection'
          | 'childEntities'
          | 'childEntitiesThroughConnection'
          | 'entitiesByUnique'
          | 'entityFileCount'
          | 'entityFile'
          | 'entityFiles'
          | 'copyEntity'
          | 'copyManyEntities'
          | 'copyEntityWithChildren'
          | 'copyManyEntitiesWithChildren'
          | 'createEntity'
          | 'createManyEntities'
          | 'deleteFilteredEntities'
          | 'deleteFilteredEntitiesReturnScalar'
          | 'deleteFilteredEntitiesWithChildren'
          | 'deleteFilteredEntitiesWithChildrenReturnScalar'
          | 'deleteManyEntities'
          | 'deleteManyEntitiesWithChildren'
          | 'deleteEntity'
          | 'deleteEntityWithChildren'
          | 'importEntities'
          | 'pushIntoEntity'
          | 'updateFilteredEntities'
          | 'updateFilteredEntitiesReturnScalar'
          | 'updateManyEntities'
          | 'updateEntity'
          | 'uploadEntityFiles',
        >,
      },
      +includeFields?: { [entityName: string]: Array<string> },
      +excludeFields?: { [entityName: string]: Array<string> },
      +freezedFields?: { [entityName: string]: Array<string> },
      +unfreezedFields?: { [entityName: string]: Array<string> },
      +addFields?: {
        [entityName: string]: $Diff<SimplifiedEntityConfig, NotFieldyEntityConfigFields>,
      },
      +derivativeFields?: { [entityName: string]: { [fieldName: string]: string } }, // set appropriate derivative keys
    },
  },
  +enums?: Enums,
  inventory?: Inventory,
};

export type ObjectSignatureMethods = {
  // the same code as used above in GeneralConfig for Input
  // when the name method return "" (empty string) => object will be rejected
  +name: string,
  +specificName: (entityConfig: EntityConfig, generalConfig: GeneralConfig) => string,
  +fieldNames: (entityConfig: EntityConfig, generalConfig: GeneralConfig) => $ReadOnlyArray<string>,
  +fieldTypes: (entityConfig: EntityConfig, generalConfig: GeneralConfig) => $ReadOnlyArray<string>,
};

export type ActionSignatureMethods = {
  // the same code as used above in GeneralConfig for Query & Mutation
  // when the name method return "" (empty string) => action will be rejected
  +name: string,
  +specificName: (entityConfig: EntityConfig, generalConfig: GeneralConfig) => string,
  +argNames: (entityConfig: EntityConfig, generalConfig: GeneralConfig) => $ReadOnlyArray<string>,
  +argTypes: (entityConfig: EntityConfig, generalConfig: GeneralConfig) => $ReadOnlyArray<string>,
  +involvedEntityNames: (
    entityConfig: EntityConfig,
    generalConfig: GeneralConfig,
  ) => { [key: string]: string },
  +type: (entityConfig: EntityConfig, generalConfig: GeneralConfig) => string,
  +config: (entityConfig: EntityConfig, generalConfig: GeneralConfig) => null | EntityConfig,
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
  +derivativeKey: string,
  +allow: {
    // eslint-disable-next-line flowtype/generic-spacing
    [entityName: string]: Array<
      | 'entity'
      | 'childEntity'
      | 'entityCount'
      | 'entityDistinctValues'
      | 'entities'
      | 'entitiesThroughConnection'
      | 'childEntities'
      | 'childEntitiesThroughConnection'
      | 'entitiesByUnique'
      | 'entityFileCount'
      | 'entityFile'
      | 'entityFiles'
      | 'copyEntity'
      | 'copyManyEntities'
      | 'copyEntityWithChildren'
      | 'copyManyEntitiesWithChildren'
      | 'createEntity'
      | 'createManyEntities'
      | 'deleteFilteredEntities'
      | 'deleteFilteredEntitiesReturnScalar'
      | 'deleteFilteredEntitiesWithChildren'
      | 'deleteFilteredEntitiesWithChildrenReturnScalar'
      | 'deleteManyEntities'
      | 'deleteManyEntitiesWithChildren'
      | 'deleteEntity'
      | 'deleteEntityWithChildren'
      | 'importEntities'
      | 'pushIntoEntity'
      | 'updateFilteredEntities'
      | 'updateFilteredEntitiesReturnScalar'
      | 'updateManyEntities'
      | 'updateEntity'
      | 'uploadEntityFiles',
    >,
  },
  +includeFields?: { [entityName: string]: Array<string> },
  +excludeFields?: { [entityName: string]: Array<string> },
  +freezedFields?: { [entityName: string]: Array<string> },
  +unfreezedFields?: { [entityName: string]: Array<string> },
  +addFields?: {
    [entityName: string]: $Diff<SimplifiedEntityConfig, NotFieldyEntityConfigFields>,
  },
  +derivativeFields?: { [entityName: string]: { [fieldName: string]: string } }, // set appropriate derivative keys
};

type OneSegmentInventoryChain = ['Query'] | ['Mutation'] | ['Subscription'];
export type TwoSegmentInventoryChain =
  | [
      'Query',
      // "string" for 'entity', 'childEntity', 'entities', 'childEntities', 'childEntitiesThroughConnection', 'entitiesByUnique', 'entitiesThroughConnection', 'entityDistinctValues', 'entityFile', 'entityFiles', 'entityFileCount' or custom query
      string,
    ]
  | [
      'Mutation',
      // "string" for 'copyEntity', 'copyManyEntities', 'copyEntityWithChildren', 'copyManyEntitiesWithChildren', 'createEntity', 'createManyEntities',
      // ... 'updateFilteredEntities', 'updateManyEntities', 'updateEntity', 'deleteFilteredEntities', 'deleteManyEntities', ...
      // ... 'deleteEntity', 'deleteEntityWithChildren', 'pushIntoEntity' or custom mutation
      string,
    ]
  | ['Subscription', 'createdEntity' | 'updatedEntity' | 'deletedEntity'];
export type ThreeSegmentInventoryChain =
  | [
      'Query',
      // first "string" for 'entity', 'childEntity', 'entities', 'childEntities', 'childEntitiesThroughConnection', 'entitiesByUnique', 'entitiesThroughConnection', 'entityDistinctValues', 'entityFile', 'entityFiles', 'entityFileCount' or custom query, second for entity name
      string,
      string,
    ]
  | [
      'Mutation',
      // "string" for 'copyEntity', 'copyManyEntities', 'copyEntityWithChildren', 'copyManyEntitiesWithChildren', 'createEntity', 'createManyEntities',
      // ... 'updateFilteredEntities', 'updateManyEntities', 'updateEntity', 'deleteFilteredEntities', 'deleteManyEntities', ...
      // ... 'deleteEntity', 'deleteEntityWithChildren', 'pushIntoEntity' or custom mutation
      string,
      string, //  second "string" for entity name
    ]
  | ['Subscription', 'createdEntity' | 'updatedEntity' | 'deletedEntity', string]; //  "string" for entity name

export type InventoryСhain =
  | OneSegmentInventoryChain
  | TwoSegmentInventoryChain
  | ThreeSegmentInventoryChain;

export type InventoryByPermissions = {
  // must be setted for all permissions and plus for empty string ""
  [permission: string]: Inventory,
};

export type InventoryByRoles = {
  // must be setted for all roles
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

type UserAttributes = { ...Object, roles: Array<string> };

export type ServersideConfig = {
  +transactions?: boolean,

  +Query?: {
    +[customQueryName: string]: (
      entityConfig: EntityConfig,
      generalConfig: GeneralConfig,
      serversideConfig: ServersideConfig,
    ) => Function,
  },

  +Mutation?: {
    +[customMutationName: string]: (
      entityConfig: EntityConfig,
      generalConfig: GeneralConfig,
      serversideConfig: ServersideConfig,
    ) => Function,
  },

  // *** fields that used in "executeAuthorisation" util

  +getUserAttributes?: ({ context: Object }) => Promise<UserAttributes>,

  +inventoryByRoles?: InventoryByRoles, // "inventoryByRoles" can used only with help of "getUserAttributes" & "containedRoles"

  +containedRoles?: { [roleName: string]: Array<string> },

  +filters?: { [tangibleEntityName: string]: (UserAttributes) => null | Array<Object> }, // "filters" can used only with help of "getUserAttributes"

  // ***

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
  EntityConfig,
  {
    [oppositeName: string]: {|
      +oppositeIds: Array<string>,
      +array: boolean,
      +name: string,
      +oppositeConfig: EntityConfig,
    |},
  },
>;

export type NearInput = {|
  +geospatialField: string,
  +coordinates: GeospatialPoint,
  +maxDistance?: number,
  +minDistance?: number,
|};

export type NearMongodb = {
  // as key using [fieldName].coordinates
  [key: string]: {
    $nearSphere: {
      $geometry: MongodbGeospatialPoint,
      $maxDistance?: number,
      $minDistance?: number,
    },
  },
};

export type NearForAggregateMongodb = {
  near: MongodbGeospatialPoint,
  maxDistance?: number,
  minDistance?: number,
  distanceField: string,
  key: string,
  spherical: true,
};

export type LookupMongodb = {
  $lookup: {
    from: string,
    localField: string,
    foreignField: '_id',
    as: string,
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
  config: EntityConfig | null,
  outdated: boolean,
};

export type InputCreator = (
  entityConfig: EntityConfig,
) => [string, string, { [inputSpecificName: string]: [InputCreator, EntityConfig] }];

export type VirtualConfigComposer = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
) => EntityConfig;

export type ActionAttributes = {
  actionGeneralName: (derivativeKey?: string) => string,
  actionType: 'Mutation' | 'Query',
  actionAllowed: (entityConfig: EntityConfig) => boolean,
  actionIsChild?: boolean,
  actionName: (baseName: string, derivativeKey?: string) => string,
  inputCreators: Array<InputCreator>,
  argNames: Array<string>,
  argTypes: Array<(name: string) => string>,
  actionInvolvedEntityNames: (name: string, derivativeKey?: string) => { [key: string]: string },
  actionReturnString: (derivativeKey: string) => (entityConfig: EntityConfig) => string,
  actionReturnConfig: (
    entityConfig: EntityConfig,
    generalConfig: GeneralConfig,
    derivativeKey?: string,
  ) => EntityConfig | null,
  actionDerivativeUpdater?: (entityName: string, item: { ...DerivativeAttributes }) => void,
  actionUseSubscription?: string,
};

export type GqlActionData = {
  actionType: string,
  actionName: string,
  derivativeKey?: string,
  entityName: string,
  composeOptions: Function,
};
