import { GraphQLResolveInfo } from 'graphql';
import { Connection, Types } from 'mongoose';
import { PubSub } from 'graphql-subscriptions';
import { Filter } from 'mongodb';

export type ProjectionInfo = { projection: { [fieldName: string]: 1 } };

export type SintheticResolverInfo = GraphQLResolveInfo | ProjectionInfo;

// export type Context = Omit<Record<string, any>, 'mongooseConn' | 'pubsub'> & {
//   mongooseConn: Connection;
//   pubsub?: PubSub;
// };
export type Context = Record<string, any>;

export type MongodbGeospatialPoint = {
  type: 'Point';
  coordinates: [number, number];
};

export type MongodbGeospatialPolygon = {
  type: 'Polygon';
  coordinates: Array<Array<[number, number]>>;
};

export type GeospatialPoint = {
  lng: number;
  lat: number;
};

export type GeospatialPolygon = {
  externalRing: {
    ring: Array<GeospatialPoint>;
  };
  internalRings?: Array<{
    ring: Array<GeospatialPoint>;
  }>;
};

type FieldCommonProperties = {
  name: string;
  required?: boolean;
  freeze?: boolean;
  index?: boolean;
  unique?: boolean;
};

type ArrayBooleanField = Omit<FieldCommonProperties, 'unique'> & {
  array: true;
  default?: boolean[];
  type: 'booleanFields';
};
type ScalarBooleanField = Omit<FieldCommonProperties, 'unique'> & {
  array?: false;
  default?: boolean;
  type: 'booleanFields';
};
export type BooleanField = ScalarBooleanField | ArrayBooleanField;

type ScalarEnumField = Omit<FieldCommonProperties, 'unique'> & {
  array?: false;
  default?: string;
  enumName: string;
  type: 'enumFields';
};
type ArrayEnumField = Omit<FieldCommonProperties, 'unique'> & {
  array: true;
  default?: string[];
  enumName: string;
  type: 'enumFields';
};
export type EnumField = ArrayEnumField | ScalarEnumField;

type ScalarGeospatialField = Omit<FieldCommonProperties, 'unique' | 'index'> & {
  array?: false;
  geospatialType: 'Point' | 'Polygon';
  type: 'geospatialFields';
};
type ArrayGeospatialField = Omit<FieldCommonProperties, 'unique' | 'index'> & {
  array: true;
  geospatialType: 'Point' | 'Polygon';
  type: 'geospatialFields';
};
export type GeospatialField = ScalarGeospatialField | ArrayGeospatialField;

type ScalarTextField = FieldCommonProperties & {
  array?: false;
  default?: string;
  weight?: number;
  type: 'textFields';
};
type ArrayTextField = FieldCommonProperties & {
  array: true;
  default?: string[];
  weight?: number;
  type: 'textFields';
};
type TextField = ScalarTextField | ArrayTextField;

type ScalarDateTimeField = FieldCommonProperties & {
  array?: false;
  default?: Date;
  type: 'dateTimeFields';
};
type ArrayDateTimeField = FieldCommonProperties & {
  array: true;
  default?: Date[];
  type: 'dateTimeFields';
};
type DateTimeField = ScalarDateTimeField | ArrayDateTimeField;

type ScalarIntField = FieldCommonProperties & {
  array?: false;
  default?: number;
  type: 'intFields';
};
type ArrayIntField = FieldCommonProperties & { array: true; default?: number[]; type: 'intFields' };
type IntField = ScalarIntField | ArrayIntField;

type ScalarFloatField = FieldCommonProperties & {
  array?: false;
  default?: number;
  type: 'floatFields';
};
type ArrayFloatField = FieldCommonProperties & {
  array: true;
  default?: number[];
  type: 'floatFields';
};
type FloatField = ScalarFloatField | ArrayFloatField;

type ScalarSimplifiedEmbeddedField = Omit<FieldCommonProperties, 'unique'> & {
  array?: false;
  configName: string;
};
type ArraySimplifiedEmbeddedField = Omit<FieldCommonProperties, 'unique'> & {
  array: true;
  configName: string;
  variants?: Array<'plain' | 'connection' | 'count'>;
};
type SimplifiedEmbeddedField = ArraySimplifiedEmbeddedField | ScalarSimplifiedEmbeddedField;

type ScalarSimplifiedFileField = Omit<FieldCommonProperties, 'unique'> & {
  array?: false;
  configName: string;
};
type ArraySimplifiedFileField = Omit<FieldCommonProperties, 'unique'> & {
  array: true;
  configName: string;
  variants?: Array<'plain' | 'connection' | 'count'>;
};
type SimplifiedFileField = ArraySimplifiedFileField | ScalarSimplifiedFileField;

type ScalarSimplifiedRelationalField = FieldCommonProperties & {
  array?: false;
  configName: string;
  oppositeName: string;
};
type ArraySimplifiedRelationalField = FieldCommonProperties & {
  array: true;
  configName: string;
  oppositeName: string;
};
type SimplifiedRelationalField = ArraySimplifiedRelationalField | ScalarSimplifiedRelationalField;

type ScalarSimplifiedDuplexField = FieldCommonProperties & {
  array?: false;
  configName: string;
  oppositeName: string;
  parent?: boolean;
};
type ArraySimplifiedDuplexField = FieldCommonProperties & {
  array: true;
  configName: string;
  oppositeName: string;
  parent?: boolean;
};
type SimplifiedDuplexField = ArraySimplifiedDuplexField | ScalarSimplifiedDuplexField;

type ScalarSimplifiedFilterField = Omit<FieldCommonProperties, 'index' | 'unique'> & {
  array?: false;
  configName: string;
  variants?: Array<'plain' | 'stringified'>;
};
type ArraySimplifiedFilterField = Omit<FieldCommonProperties, 'index' | 'unique'> & {
  array: true;
  configName: string;
  variants?: Array<'plain' | 'stringified'>;
};
type SimplifiedFilterField = ArraySimplifiedFilterField | ScalarSimplifiedFilterField;

type ScalarSimplifiedChildField = Omit<FieldCommonProperties, 'freeze' | 'index' | 'unique'> & {
  array?: false;
  configName: string;
};
type ArraySimplifiedChildField = Omit<FieldCommonProperties, 'freeze' | 'index' | 'unique'> & {
  array: true;
  configName: string;
};
type SimplifiedChildField = ArraySimplifiedChildField | ScalarSimplifiedChildField;

type ScalarSimplifiedCalculatedEnumField = Omit<
  FieldCommonProperties,
  'freeze' | 'index' | 'unique'
> & {
  array?: false;
  calculatedType: 'enumFields';
  enumName: string;
  asyncFunc?: (resolverArg: ResolverArg) => Promise<any>;
  args: string[];
  func: (
    args: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
  ) => null | string;
};
type ArraySimplifiedCalculatedEnumField = Omit<
  FieldCommonProperties,
  'freeze' | 'index' | 'unique'
> & {
  array: true;
  calculatedType: 'enumFields';
  enumName: string;
  asyncFunc?: (resolverArg: ResolverArg) => Promise<any>;
  args: string[];
  func: (
    args: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
  ) => string[];
};
type ScalarSimplifiedCalculatedEmbeddedOrFileField = Omit<
  FieldCommonProperties,
  'freeze' | 'index' | 'unique'
> & {
  array?: false;
  calculatedType: 'embeddedFields' | 'fileFields';
  configName: string;
  asyncFunc?: (resolverArg: ResolverArg) => Promise<any>;
  args: string[];
  func: (
    args: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
  ) => GraphqlObject;
};
type ArraySimplifiedCalculatedEmbeddedOrFileField = Omit<
  FieldCommonProperties,
  'freeze' | 'index' | 'unique'
> & {
  array: true;
  calculatedType: 'embeddedFields' | 'fileFields';
  configName: string;
  asyncFunc?: (resolverArg: ResolverArg) => Promise<any>;
  args: string[];
  func: (
    args: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
  ) => GraphqlObject[];
};
type ScalarSimplifiedCalculatedGeospatialField = Omit<
  FieldCommonProperties,
  'freeze' | 'index' | 'unique'
> & {
  array?: false;
  calculatedType: 'geospatialFields';
  geospatialType: 'Point' | 'Polygon';
  asyncFunc?: (resolverArg: ResolverArg) => Promise<any>;
  args: string[];
  func: (
    args: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
  ) => null | GeospatialPoint | GeospatialPolygon;
};
type ArraySimplifiedCalculatedGeospatialField = Omit<
  FieldCommonProperties,
  'freeze' | 'index' | 'unique'
> & {
  array: true;
  calculatedType: 'geospatialFields';
  geospatialType: 'Point' | 'Polygon';
  asyncFunc?: (resolverArg: ResolverArg) => Promise<any>;
  args: string[];
  func: (
    args: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
  ) => GeospatialPoint[] | GeospatialPolygon[];
};
type ScalarSimplifiedCalculatedField = Omit<
  FieldCommonProperties,
  'freeze' | 'index' | 'unique'
> & {
  array?: false;
  calculatedType: 'booleanFields' | 'dateTimeFields' | 'intFields' | 'floatFields' | 'textFields';
  asyncFunc?: (resolverArg: ResolverArg) => Promise<any>;
  args: string[];
  func: (
    args: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
  ) => GraphqlScalar;
};
type ArraySimplifiedCalculatedField = Omit<FieldCommonProperties, 'freeze' | 'index' | 'unique'> & {
  array: true;
  calculatedType: 'booleanFields' | 'dateTimeFields' | 'intFields' | 'floatFields' | 'textFields';
  asyncFunc?: (resolverArg: ResolverArg) => Promise<any>;
  args: string[];
  func: (
    args: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
  ) => GraphqlScalar[];
};
type SimplifiedCalculatedField =
  | ArraySimplifiedCalculatedEmbeddedOrFileField
  | ScalarSimplifiedCalculatedEmbeddedOrFileField
  | ArraySimplifiedCalculatedEnumField
  | ScalarSimplifiedCalculatedEnumField
  | ArraySimplifiedCalculatedGeospatialField
  | ScalarSimplifiedCalculatedGeospatialField
  | ArraySimplifiedCalculatedField
  | ScalarSimplifiedCalculatedField;

type SimplifiedEntityConfigCommonProperties = {
  name: string;
  interfaces?: string[];
  derivativeNameSlicePosition?: number;
  duplexFields?: SimplifiedDuplexField[];
  embeddedFields?: SimplifiedEmbeddedField[];
  fileFields?: SimplifiedFileField[];
  filterFields?: SimplifiedFilterField[];
  relationalFields?: SimplifiedRelationalField[];
  booleanFields?: Omit<BooleanField, 'type'>[];
  dateTimeFields?: Omit<DateTimeField, 'type'>[];
  enumFields?: Omit<EnumField, 'type'>[];
  geospatialFields?: Omit<GeospatialField, 'type'>[];
  intFields?: Omit<IntField, 'type'>[];
  floatFields?: Omit<FloatField, 'type'>[];
  textFields?: Omit<TextField, 'type'>[];
  calculatedFields?: SimplifiedCalculatedField[];
};

export type SimplifiedTangibleEntityConfig = SimplifiedEntityConfigCommonProperties & {
  type?: 'tangible';
  counter?: boolean;
};
export type SimplifiedEmbeddedEntityConfig = Omit<
  SimplifiedEntityConfigCommonProperties,
  'relationalFields' | 'duplexFields' | 'filterFields'
> & {
  type: 'embedded';
};
export type SimplifiedFileEntityConfig = Omit<
  SimplifiedEntityConfigCommonProperties,
  'relationalFields' | 'duplexFields' | 'filterFields'
> & {
  type: 'file';
};
export type SimplifiedTangibleFileEntityConfig = Omit<
  SimplifiedEntityConfigCommonProperties,
  'relationalFields' | 'duplexFields' | 'filterFields'
> & {
  type: 'tangibleFile';
};
export type SimplifiedVirtualEntityConfig = SimplifiedEntityConfigCommonProperties & {
  type: 'virtual';
  childFields?: SimplifiedChildField[];
};

export type SimplifiedEntityConfig =
  | SimplifiedTangibleEntityConfig
  | SimplifiedEmbeddedEntityConfig
  | SimplifiedFileEntityConfig
  | SimplifiedTangibleFileEntityConfig
  | SimplifiedVirtualEntityConfig;

type ScalarEmbeddedField = Omit<FieldCommonProperties, 'unique'> & {
  array?: false;
  config: EmbeddedEntityConfig;
  type: 'embeddedFields';
};
type ArrayEmbeddedField = Omit<FieldCommonProperties, 'unique'> & {
  array: true;
  config: EmbeddedEntityConfig;
  type: 'embeddedFields';
  variants: Array<'plain' | 'connection' | 'count'>;
};
export type EmbeddedField = ArrayEmbeddedField | ScalarEmbeddedField;

type ScalarFileField = Omit<FieldCommonProperties, 'unique'> & {
  array?: false;
  config: FileEntityConfig;
  type: 'fileFields';
};
type ArrayFileField = Omit<FieldCommonProperties, 'unique'> & {
  array: true;
  config: FileEntityConfig;
  type: 'fileFields';
  variants: Array<'plain' | 'connection' | 'count'>;
};
export type FileField = ArrayFileField | ScalarFileField;

type ScalarRelationalField = FieldCommonProperties & {
  array?: false;
  config: TangibleEntityConfig;
  oppositeName: string;
  parent?: false;
  type: 'relationalFields';
};
type ArrayRelationalField = FieldCommonProperties & {
  array: true;
  config: TangibleEntityConfig;
  oppositeName: string;
  parent?: false;
  type: 'relationalFields';
};
type ArrayParentRelationalField = Omit<
  FieldCommonProperties,
  'required' | 'freeze' | 'index' | 'unique'
> & {
  array: true;
  config: TangibleEntityConfig;
  oppositeName: string;
  parent: true;
  required?: false;
  freeze?: false;
  index?: false;
  unique?: false;
  type: 'relationalFields';
};
export type RelationalField =
  | ArrayRelationalField
  | ScalarRelationalField
  | ArrayParentRelationalField;

type ScalarDuplexField = FieldCommonProperties & {
  array?: false;
  config: TangibleEntityConfig;
  oppositeName: string;
  parent?: boolean;
  type: 'duplexFields';
};
type ArrayDuplexField = FieldCommonProperties & {
  array: true;
  config: TangibleEntityConfig;
  oppositeName: string;
  parent?: boolean;
  type: 'duplexFields';
};
export type DuplexField = ArrayDuplexField | ScalarDuplexField;

type ScalarFilterField = Omit<FieldCommonProperties, 'index' | 'unique'> & {
  array?: false;
  config: TangibleEntityConfig;
  type: 'filterFields';
  variants: Array<'stringified'>;
};
type ArrayFilterField = Omit<FieldCommonProperties, 'index' | 'unique'> & {
  array: true;
  config: TangibleEntityConfig;
  type: 'filterFields';
  variants: Array<'stringified'>;
};
export type FilterField = ArrayFilterField | ScalarFilterField;

type ScalarChildField = Omit<FieldCommonProperties, 'freeze' | 'index' | 'unique'> & {
  array?: false;
  config: VirtualEntityConfig | TangibleEntityConfig;
  type: 'childFields';
};
type ArrayChildField = Omit<FieldCommonProperties, 'freeze' | 'index' | 'unique'> & {
  array: true;
  config: VirtualEntityConfig | TangibleEntityConfig;
  type: 'childFields';
};
type ChildField = ArrayChildField | ScalarChildField;

type ScalarCalculatedEnumField = Omit<FieldCommonProperties, 'freeze' | 'index' | 'unique'> & {
  array?: false;
  calculatedType: 'enumFields';
  enumName: string;
  asyncFunc?: (resolverArg: ResolverArg) => Promise<any>;
  args: string[];
  func: (
    args: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
  ) => null | string;
  type: 'calculatedFields';
};
type ArrayCalculatedEnumField = Omit<FieldCommonProperties, 'freeze' | 'index' | 'unique'> & {
  array: true;
  calculatedType: 'enumFields';
  enumName: string;
  asyncFunc?: (resolverArg: ResolverArg) => Promise<any>;
  args: string[];
  func: (
    args: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
  ) => string[];
  type: 'calculatedFields';
};
type ScalarCalculatedEmbeddedOrFileField = Omit<
  FieldCommonProperties,
  'freeze' | 'index' | 'unique'
> & {
  array?: false;
  calculatedType: 'embeddedFields' | 'fileFields';
  config: EmbeddedEntityConfig | FileEntityConfig;
  asyncFunc?: (resolverArg: ResolverArg) => Promise<any>;
  args: string[];
  func: (
    args: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
  ) => GraphqlObject;
  type: 'calculatedFields';
};
type ArrayCalculatedEmbeddedOrFileField = Omit<
  FieldCommonProperties,
  'freeze' | 'index' | 'unique'
> & {
  array: true;
  calculatedType: 'embeddedFields' | 'fileFields';
  config: EmbeddedEntityConfig | FileEntityConfig;
  asyncFunc?: (resolverArg: ResolverArg) => Promise<any>;
  args: string[];
  func: (
    args: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
  ) => GraphqlObject[];
  type: 'calculatedFields';
};
type ScalarCalculatedGeospatialField = Omit<
  FieldCommonProperties,
  'freeze' | 'index' | 'unique'
> & {
  array?: false;
  calculatedType: 'geospatialFields';
  geospatialType: 'Point' | 'Polygon';
  asyncFunc?: (resolverArg: ResolverArg) => Promise<any>;
  args: string[];
  func: (
    args: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
  ) => null | GeospatialPoint | GeospatialPolygon;
  type: 'calculatedFields';
};
type ArrayCalculatedGeospatialField = Omit<FieldCommonProperties, 'freeze' | 'index' | 'unique'> & {
  array: true;
  calculatedType: 'geospatialFields';
  geospatialType: 'Point' | 'Polygon';
  asyncFunc?: (resolverArg: ResolverArg) => Promise<any>;
  args: string[];
  func: (
    args: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
  ) => GeospatialPoint[] | GeospatialPolygon[];
  type: 'calculatedFields';
};
type ScalarCalculatedField = Omit<FieldCommonProperties, 'freeze' | 'index' | 'unique'> & {
  array?: false;
  calculatedType: 'booleanFields' | 'dateTimeFields' | 'intFields' | 'floatFields' | 'textFields';
  asyncFunc?: (resolverArg: ResolverArg) => Promise<any>;
  args: string[];
  func: (
    args: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
  ) => GraphqlScalar;
  type: 'calculatedFields';
};
type ArrayCalculatedField = Omit<FieldCommonProperties, 'freeze' | 'index' | 'unique'> & {
  array: true;
  calculatedType: 'booleanFields' | 'dateTimeFields' | 'intFields' | 'floatFields' | 'textFields';
  asyncFunc?: (resolverArg: ResolverArg) => Promise<any>;
  args: string[];
  func: (
    args: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
  ) => GraphqlScalar;
  type: 'calculatedFields';
};
type CalculatedField =
  | ArrayCalculatedEnumField
  | ScalarCalculatedEnumField
  | ArrayCalculatedEmbeddedOrFileField
  | ScalarCalculatedEmbeddedOrFileField
  | ArrayCalculatedGeospatialField
  | ScalarCalculatedGeospatialField
  | ArrayCalculatedGeospatialField
  | ScalarCalculatedGeospatialField
  | ArrayCalculatedField
  | ScalarCalculatedField;

type EntityConfigCommonProperties = {
  name: string;
  interfaces?: string[];
  descendantNameSlicePosition?: number;
  duplexFields?: DuplexField[];
  embeddedFields?: EmbeddedField[];
  fileFields?: FileField[];
  filterFields?: FilterField[];
  relationalFields?: RelationalField[];
  booleanFields?: BooleanField[];
  dateTimeFields?: DateTimeField[];
  enumFields?: EnumField[];
  geospatialFields?: GeospatialField[];
  intFields?: IntField[];
  floatFields?: FloatField[];
  textFields?: TextField[];
  calculatedFields?: CalculatedField[];
};

export type TangibleEntityConfig = EntityConfigCommonProperties & {
  type?: 'tangible';
  counter?: boolean;
};
export type EmbeddedEntityConfig = Omit<
  EntityConfigCommonProperties,
  'relationalFields' | 'duplexFields' | 'filterFields' | 'calculatedFields'
> & {
  type: 'embedded';
};
export type FileEntityConfig = Omit<
  EntityConfigCommonProperties,
  'relationalFields' | 'duplexFields' | 'filterFields' | 'calculatedFields'
> & {
  type: 'file';
};
export type TangibleFileEntityConfig = Omit<
  EntityConfigCommonProperties,
  'relationalFields' | 'duplexFields' | 'filterFields' | 'calculatedFields'
> & {
  type: 'tangibleFile';
};
export type VirtualEntityConfig = EntityConfigCommonProperties & {
  type: 'virtual';
  childFields?: ChildField[];
};

export type EntityConfig =
  | TangibleEntityConfig
  | EmbeddedEntityConfig
  | FileEntityConfig
  | TangibleFileEntityConfig
  | VirtualEntityConfig;

export type FlatField =
  | RelationalField
  | DuplexField
  | FilterField
  | ChildField
  | TextField
  | FloatField
  | IntField
  | GeospatialField
  | EnumField
  | DateTimeField
  | BooleanField
  | CalculatedField;

export type AnyField =
  | BooleanField
  | DateTimeField
  | DuplexField
  | FilterField
  | EmbeddedField
  | EnumField
  | FileField
  | FloatField
  | GeospatialField
  | IntField
  | RelationalField
  | ChildField
  | TextField
  | CalculatedField;

export type EntityConfigObject = {
  [fieldName: string]: AnyField;
};

export type Enums = {
  /** enums list */
  [name: string]: string[];
};

type entityNamesList = true | Array<string>;

export type SimplifiedInventoryOptions = {
  Query: {
    [queryName: string]: Array<string>;
  };
  Mutation: {
    [mutationName: string]: Array<string>;
  };
};

export type InventoryOptions = {
  Query?:
    | true
    | {
        // 'queryName' may be: entity, entities, , 'entityDistinctValues' or any custom query names
        [queryName: string]: entityNamesList;
      };
  Mutation?:
    | true
    | {
        // 'mutationName' may be: 'copyEntity', 'createEntity', 'createManyEntities', 'updateManyEntities', 'updateEntity', 'deleteEntity', ...
        // ... 'pushIntoEntity', or custom mutation

        [mutationName: string]: entityNamesList;
      };
  Subscription?:
    | true
    | {
        createdEntity?: entityNamesList;
        updatedEntity?: entityNamesList;
        deletedEntity?: entityNamesList;
      };
};

export type Inventory = {
  name: string;
  include?: true | InventoryOptions;
  exclude?: true | InventoryOptions;
};

export type DescendantAttributesActionName =
  | 'entity'
  | 'childEntity'
  | 'childEntityCount'
  | 'childEntityDistinctValues'
  | 'childEntityGetOrCreate'
  | 'cloneEntity'
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
  | 'uploadEntityFiles';

export type DescendantAttributes = {
  descendantKey: string;
  allow: {
    [entityName: string]: DescendantAttributesActionName[];
  };
  interfaces?: {
    [entityName: string]: Array<string>;
  };
  includeFields?: {
    [entityName: string]: Array<string>;
  };
  excludeFields?: {
    [entityName: string]: Array<string>;
  };
  freezedFields?: {
    [entityName: string]: Array<string>;
  };
  unfreezedFields?: {
    [entityName: string]: Array<string>;
  };
  addFields?: {
    [entityName: string]: Omit<
      SimplifiedTangibleEntityConfig,
      'name' | 'type' | 'counter' | 'descendantNameSlicePosition'
    >;
  };
  involvedOutputDescendantKeys?: {
    [entityName: string]: {
      outputEntity: string;
    };
  };
};

export type ObjectSignatureMethods = {
  name: string;
  specificName: (entityConfig: EntityConfig, generalConfig?: GeneralConfig) => string;
  fieldNames: (entityConfig: EntityConfig, generalConfig?: GeneralConfig) => Array<string>;
  fieldTypes: (entityConfig: EntityConfig, generalConfig?: GeneralConfig) => Array<string>;
};

export type ActionSignatureMethods = {
  name: string;
  specificName: (entityConfig: EntityConfig, generalConfig?: GeneralConfig) => string;
  argNames: (entityConfig: EntityConfig, generalConfig?: GeneralConfig) => Array<string>;
  argTypes: (entityConfig: EntityConfig, generalConfig?: GeneralConfig) => Array<string>;
  involvedEntityNames: (
    entityConfig: EntityConfig,
    generalConfig?: GeneralConfig,
  ) => {
    [key: string]: string;
  };
  type: (entityConfig: EntityConfig, generalConfig?: GeneralConfig) => string;
  config: (entityConfig: EntityConfig, generalConfig?: GeneralConfig) => null | EntityConfig;
};

export type GeneralConfig = {
  allEntityConfigs: {
    [entityConfigName: string]: EntityConfig;
  };
  custom?: {
    Input?: {
      [customInputName: string]: ObjectSignatureMethods;
    };
    Query?: {
      [customQueryName: string]: ActionSignatureMethods;
    };
    Mutation?: {
      [customMutationName: string]: ActionSignatureMethods;
    };
  };
  descendant?: {
    // whole fefault descendant name = entityName (baseName) + descendantKey
    // OR compose from descendantNameSlicePosition entity config attribute (if it's setted)
    [descendantKey: string]: DescendantAttributes;
  };
  enums?: Enums;
  inventory?: Inventory;
  interfaces?: { [interfaceName: string]: string[] };
};

// equal to previous code of 'custom' property
export type Custom = {
  Input?: {
    [customInputName: string]: ObjectSignatureMethods;
  };
  Query?: {
    [customQueryName: string]: ActionSignatureMethods;
  };
  Mutation?: {
    [customMutationName: string]: ActionSignatureMethods;
  };
};

type OneSegmentInventoryChain = ['Query'] | ['Mutation'] | ['Subscription'];
export type TwoSegmentInventoryChain =
  | [
      'Query', // "string" for 'entity', 'childEntity', 'childEntityGetOrCreate', 'entities', 'childEntities', 'childEntitiesThroughConnection', 'entitiesByUnique', 'entitiesThroughConnection', 'entityDistinctValues', 'entityFile', 'entityFiles', 'entityFileCount' or custom query
      string,
    ]
  | [
      'Mutation', // "string" for 'copyEntity', 'copyManyEntities', 'copyEntityWithChildren', 'copyManyEntitiesWithChildren', 'createEntity', 'createManyEntities',
      // ... 'updateFilteredEntities', 'updateManyEntities', 'updateEntity', 'deleteFilteredEntities', 'deleteManyEntities', ...
      // ... 'deleteEntity', 'deleteEntityWithChildren', 'pushIntoEntity' or custom mutation
      string,
    ]
  | ['Subscription', 'createdEntity' | 'updatedEntity' | 'deletedEntity'];
export type ThreeSegmentInventoryChain =
  | [
      'Query', // first "string" for 'entity', 'childEntity', 'childEntityGetOrCreate', 'entities', 'childEntities', 'childEntitiesThroughConnection', 'entitiesByUnique', 'entitiesThroughConnection', 'entityDistinctValues', 'entityFile', 'entityFiles', 'entityFileCount' or custom query, second for entity name
      string,
      string,
    ]
  | [
      'Mutation', // "string" for 'copyEntity', 'copyManyEntities', 'copyEntityWithChildren', 'copyManyEntitiesWithChildren', 'createEntity', 'createManyEntities',
      // ... 'updateFilteredEntities', 'updateManyEntities', 'updateEntity', 'deleteFilteredEntities', 'deleteManyEntities', ...
      // ... 'deleteEntity', 'deleteEntityWithChildren', 'pushIntoEntity' or custom mutation
      string, //  second "string" for entity name
      string,
    ]
  | ['Subscription', 'createdEntity' | 'updatedEntity' | 'deletedEntity', string]; //  "string" for entity name

export type InventoryСhain =
  | OneSegmentInventoryChain
  | TwoSegmentInventoryChain
  | ThreeSegmentInventoryChain;

export type InventoryByRoles = {
  // must be setted for all roles
  [role: string]: Inventory;
};

export type FileAttributes = {
  _id?: string;
  hash: string;
  filename: string;
  mimetype: string;
  encoding: string;
  uploadedAt: Date;
};

export type DataObject = {
  [key: string]: any;
};

type Merge<A, B> = { [K in keyof A]: K extends keyof B ? B[K] : A[K] } & B;

export type InvolvedFilter = Merge<
  { [key: string]: GraphqlScalar | InvolvedFilter | InvolvedFilter[] },
  { AND?: InvolvedFilter[]; OR?: InvolvedFilter[]; XOR?: InvolvedFilter[] }
>;

type UserAttributes = Merge<DataObject, { roles: string[] }>;

export type FilterArg = Merge<DataObject, { role: string }>;

export type SimplifiedEntityFilters = {
  [tangibleEntityName: string]: (arg1: FilterArg) => null | InvolvedFilter[];
};

export type EntityFilters = {
  [tangibleEntityName: string]: [
    /** isOutput */
    boolean,
    /** */
    (arg1: FilterArg) => null | InvolvedFilter[],
  ];
};

export type GraphqlScalar =
  | string
  | string[]
  | number
  | number[]
  | boolean
  | boolean[]
  | null
  | null[];

export type GraphqlObject = {
  [key: string]: GraphqlScalar | GraphqlObject | GraphqlObject[];
};

export type Middlewares = {
  [actionName: string]: (
    parent: null | GraphqlObject,
    args: GraphqlObject,
    context: Context,
    info: SintheticResolverInfo,
    involvedEntityNames: { [involvedEntityNamesKey: string]: string },
  ) => Promise<
    [
      null | GraphqlObject, // parent
      GraphqlObject, // args
      Context, // context
      SintheticResolverInfo, // info
      { [involvedEntityNamesKey: string]: string }, // involvedEntityNames
    ]
  >;
};

export type ActionResolver = (
  parent: null | GraphqlObject,
  args: GraphqlObject,
  context: Context,
  info: SintheticResolverInfo,
  involvedFilters: {
    [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
  },
) => Promise<GraphqlObject | GraphqlObject[] | GraphqlScalar | GraphqlScalar[] | null>;

export type ServersideConfig = {
  transactions?: boolean;
  Query?: {
    [customQueryName: string]: (
      entityConfig: EntityConfig,
      generalConfig: GeneralConfig,
      serversideConfig: ServersideConfig,
      inAnyCase?: boolean,
    ) => ActionResolver;
  };
  Mutation?: {
    [customMutationName: string]: (
      entityConfig: EntityConfig,
      generalConfig: GeneralConfig,
      serversideConfig: ServersideConfig,
      inAnyCase?: boolean,
    ) => ActionResolver;
  };

  // *** fields that used in "executeAuthorisation" util
  getUserAttributes?: (context: Context, token?: string) => Promise<UserAttributes>;
  inventoryByRoles?: InventoryByRoles; // "inventoryByRoles" can used only with help of "getUserAttributes" & "containedRoles",
  containedRoles?: {
    [roleName: string]: Array<string>;
  };
  filters?: EntityFilters; // "filters" can used only with help of "getUserAttributes",
  staticFilters?: {
    [tangibleEntityName: string]: InvolvedFilter;
  };
  staticLimits?: {
    [tangibleEntityName: string]: number;
  };

  // ***

  middlewares?: Middlewares;

  saveFiles?: {
    [fileFieldConfigName: string]: (
      file: Record<string, any>,
      hash: string,
      date: Date,
    ) => Promise<FileAttributes>;
  };
  composeFileFieldsData?: {
    [fileFieldConfigName: string]: (fileAttributes: FileAttributes) => {
      [fieldName: string]: string; // ??? add another primitive fields
    };
  };
};

export type UploadOptions = {
  targets: Array<string>; // fileFields names,
  counts: Array<number>; // count of uploaded files for each fileField,
  hashes: Array<string>; // hash of every uploaded file
};

export type Periphery = Map<
  TangibleEntityConfig,
  {
    [oppositeName: string]: {
      oppositeIds: Array<string>;
      array: boolean;
      name: string;
      oppositeConfig: TangibleEntityConfig;
    };
  }
>;

export type NearInput = {
  geospatialField: string;
  coordinates: GeospatialPoint;
  maxDistance?: number;
  minDistance?: number;
};

export type NearMongodb = {
  // as key using [fieldName].coordinates
  [key: string]: {
    $nearSphere: {
      $geometry: MongodbGeospatialPoint;
      $maxDistance?: number;
      $minDistance?: number;
    };
  };
};

export type NearForAggregateMongodb = {
  near: MongodbGeospatialPoint;
  maxDistance?: number;
  minDistance?: number;
  distanceField: string;
  key: string;
  spherical: true;
};

export type LookupMongoDB = {
  $lookup: {
    from: string;
    localField: string;
    foreignField: '_id' | string;
    as: string;
  };
};

export type SetWindowFields = {
  sortBy: {
    [calculated_distance: string]: 1 | -1;
  };
  output: {
    calculated_number: {
      $documentNumber: { [key: string]: never };
    };
  };
};

export type PipelineMongoDB = Array<
  | LookupMongoDB
  | { $match: DataObject }
  | { $project: { [fieldName: string]: 1 } }
  | { $geoNear: NearForAggregateMongodb }
  | { $skip: number }
  | { $limit: number }
  | { $sort: { index_from_parent_ids: 1 } }
  | { $sort: { score: { $meta: 'textScore' } } }
  | { $set: { index_from_parent_ids: { $indexOfArray: [DataObject[], '$_id'] } } }
  | { $count: 'count' }
  | { $setWindowFields: SetWindowFields }
>;

export type Subscribe = {
  subscribe: (
    _: null | GraphqlObject,
    arg2: {
      name: string;
    },
    arg3: {
      pubsub: PubSub;
    },
  ) => any;
};

export type ClientOptions = {
  depth?: number;
  include?: GraphqlObject;
  exclude?: GraphqlObject;
  name?: string;
};

export type ClientFieldsOptions = ClientOptions & {
  shift: number;
};

export type InputCreator = (entityConfig: EntityConfig) => [
  string,
  string,
  {
    [inputSpecificName: string]: [InputCreator, EntityConfig];
  },
];

export type VirtualConfigComposer = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
) => VirtualEntityConfig;

export type ActionAttributes = {
  actionArgsToHide?: string[]; // some of argNames to hide in schema action signature
  actionGeneralName: (descendantKey?: string) => string;
  actionType: 'Mutation' | 'Query' | 'Field';
  actionAllowed: (entityConfig: EntityConfig) => boolean;
  actionIsChild?: 'Array' | 'Scalar';
  actionName: (baseName: string, descendantKey?: string) => string;
  inputCreators: Array<InputCreator>;
  argNames: Array<string>;
  argTypes: Array<(entityConfig: EntityConfig) => string>;
  actionInvolvedEntityNames: (
    name: string,
    descendantKey?: string,
  ) => {
    [key: string]: string;
  };
  actionReturnString: (entityConfig: EntityConfig, descendantKey: string) => string;
  actionReturnConfig: (
    entityConfig: EntityConfig,
    generalConfig: GeneralConfig,
    descendantKey?: string,
  ) => EntityConfig | null;
  actionDescendantUpdater?: (entityName: string, item: DescendantAttributes) => void;
  actionUseSubscription?: string;
};

export type GqlActionData = {
  actionType: 'Query' | 'Mutation';
  actionName: string;
  descendantKey?: string;
  entityName: string;
  composeOptions: (arg: GraphqlObject) => GraphqlObject;
};

export type ResolverArg = {
  parent: null | GraphqlObject;
  args: GraphqlObject;
  context: Context;
  info: SintheticResolverInfo;
  involvedFilters: {
    [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
  };
};
