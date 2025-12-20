import { GraphQLResolveInfo } from 'graphql';

type BaseInfoEssence = {
  projection: Record<string, 1>;
  fieldArgs: Record<string, Record<string, any>>;
  fieldName?: string; // used to emulate "GraphQLResolveInfo" info in tests
};
export type InfoEssence =
  | (BaseInfoEssence & { originalInfo: GraphQLResolveInfo; path: string[] })
  | (BaseInfoEssence & { originalInfo?: undefined; path: [] });

export type SintheticResolverInfo = GraphQLResolveInfo | InfoEssence;

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
  coordinates: [number, number][][];
};

export type MongodbGeospatialMultiPolygon = {
  type: 'MultiPolygon';
  coordinates: [number, number][][][];
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

export type GeospatialMultiPolygon = {
  polygons: GeospatialPolygon[];
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
  nullable?: boolean;
  default?: boolean[];
  type: 'booleanFields';
};
type ScalarBooleanField = Omit<FieldCommonProperties, 'unique'> & {
  array?: false;
  nullable?: false;
  default?: boolean;
  type: 'booleanFields';
};
export type BooleanField = ScalarBooleanField | ArrayBooleanField;

type ScalarEnumField = Omit<FieldCommonProperties, 'unique'> & {
  array?: false;
  nullable?: false;
  default?: string;
  enumName: string;
  type: 'enumFields';
};
type ArrayEnumField = Omit<FieldCommonProperties, 'unique'> & {
  array: true;
  nullable?: boolean;
  default?: string[];
  enumName: string;
  type: 'enumFields';
};
export type EnumField = ArrayEnumField | ScalarEnumField;

type ScalarGeospatialField = Omit<FieldCommonProperties, 'unique' | 'index'> & {
  array?: false;
  nullable?: false;
  geospatialType: 'Point' | 'Polygon' | 'MultiPolygon';
  type: 'geospatialFields';
};
type ArrayGeospatialField = Omit<FieldCommonProperties, 'unique' | 'index'> & {
  array: true;
  nullable?: boolean;
  geospatialType: 'Point' | 'Polygon' | 'MultiPolygon';
  type: 'geospatialFields';
};
export type GeospatialField = ScalarGeospatialField | ArrayGeospatialField;

type ScalarTextField = FieldCommonProperties & {
  array?: false;
  nullable?: false;
  default?: string;
  weight?: number;
  type: 'textFields';
};
type ArrayTextField = FieldCommonProperties & {
  array: true;
  nullable?: boolean;
  default?: string[];
  weight?: number;
  type: 'textFields';
};
type TextField = ScalarTextField | ArrayTextField;

type ScalarDateTimeField = FieldCommonProperties & {
  array?: false;
  nullable?: false;
  default?: Date;
  type: 'dateTimeFields';
};
type ArrayDateTimeField = FieldCommonProperties & {
  array: true;
  nullable?: boolean;
  default?: Date[];
  type: 'dateTimeFields';
};
type DateTimeField = ScalarDateTimeField | ArrayDateTimeField;

type ScalarIntField = FieldCommonProperties & {
  array?: false;
  nullable?: false;
  default?: number;
  type: 'intFields';
};
type ArrayIntField = FieldCommonProperties & {
  array: true;
  nullable?: boolean;
  default?: number[];
  type: 'intFields';
};
type IntField = ScalarIntField | ArrayIntField;

type ScalarFloatField = FieldCommonProperties & {
  array?: false;
  nullable?: false;
  default?: number;
  type: 'floatFields';
};
type ArrayFloatField = FieldCommonProperties & {
  array: true;
  nullable?: boolean;
  default?: number[];
  type: 'floatFields';
};
type FloatField = ScalarFloatField | ArrayFloatField;

type ScalarSimplifiedEmbeddedField = Omit<FieldCommonProperties, 'unique'> & {
  array?: false;
  nullable?: false;
  configName: string;
};
type ArraySimplifiedEmbeddedField = Omit<FieldCommonProperties, 'unique'> & {
  array: true;
  nullable?: boolean;
  configName: string;
  variants?: Array<'plain' | 'connection' | 'count'>;
};
type SimplifiedEmbeddedField = ArraySimplifiedEmbeddedField | ScalarSimplifiedEmbeddedField;

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
export type SimplifiedDuplexField = ArraySimplifiedDuplexField | ScalarSimplifiedDuplexField;

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
  nullable?: false;
  configName: string;
};
type ArraySimplifiedChildField = Omit<FieldCommonProperties, 'freeze' | 'index' | 'unique'> & {
  array: true;
  nullable?: boolean;
  configName: string;
};
type SimplifiedChildField = ArraySimplifiedChildField | ScalarSimplifiedChildField;

export type ScalarSimplifiedCalculatedEnumField = Omit<
  FieldCommonProperties,
  'freeze' | 'index' | 'unique'
> & {
  array?: false;
  nullable?: false;
  calculatedType: 'enumFields';
  enumName: string;
  asyncFunc?: (
    args: Record<string, any>,
    resolverCreatorArg: ResolverCreatorArg,
    resolverArg: ResolverArg,
  ) => Promise<any>;
  fieldsToUseNames?: string[];
  inputTypes?: Record<string, string>;
  func: (
    args: Record<string, any>,
    data: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
    index?: number,
  ) => null | string;
};
export type ArraySimplifiedCalculatedEnumField = Omit<
  FieldCommonProperties,
  'freeze' | 'index' | 'unique'
> & {
  array: true;
  nullable?: boolean;
  calculatedType: 'enumFields';
  enumName: string;
  asyncFunc?: (
    args: Record<string, any>,
    resolverCreatorArg: ResolverCreatorArg,
    resolverArg: ResolverArg,
  ) => Promise<any>;
  fieldsToUseNames?: string[];
  inputTypes?: Record<string, string>;
  func: (
    args: Record<string, any>,
    data: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
    index?: number,
  ) => string[];
};
export type ScalarSimplifiedCalculatedEmbeddedField = Omit<
  FieldCommonProperties,
  'freeze' | 'index' | 'unique'
> & {
  array?: false;
  nullable?: false;
  calculatedType: 'embeddedFields' | 'filterFields';
  configName: string;
  asyncFunc?: (
    args: Record<string, any>,
    resolverCreatorArg: ResolverCreatorArg,
    resolverArg: ResolverArg,
  ) => Promise<any>;
  fieldsToUseNames?: string[];
  inputTypes?: Record<string, string>;
  func: (
    args: Record<string, any>,
    data: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
    index?: number,
  ) => GraphqlObject;
};
export type ArraySimplifiedCalculatedEmbeddedField = Omit<
  FieldCommonProperties,
  'freeze' | 'index' | 'unique'
> & {
  array: true;
  nullable?: boolean; // TODO fileterField must not to be nullable
  calculatedType: 'embeddedFields' | 'filterFields';
  configName: string;
  asyncFunc?: (
    args: Record<string, any>,
    resolverCreatorArg: ResolverCreatorArg,
    resolverArg: ResolverArg,
  ) => Promise<any>;
  fieldsToUseNames?: string[];
  inputTypes?: Record<string, string>;
  func: (
    args: Record<string, any>,
    data: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
    index?: number,
  ) => GraphqlObject[];
};
export type ScalarSimplifiedCalculatedFilterField = Omit<
  FieldCommonProperties,
  'freeze' | 'index' | 'unique'
> & {
  array?: false;
  calculatedType: 'embeddedFields' | 'filterFields';
  configName: string;
  asyncFunc?: (
    args: Record<string, any>,
    resolverCreatorArg: ResolverCreatorArg,
    resolverArg: ResolverArg,
  ) => Promise<any>;
  fieldsToUseNames?: string[];
  inputTypes?: Record<string, string>;
  func: (
    args: Record<string, any>,
    data: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
    index?: number,
  ) => GraphqlObject;
};
export type ArraySimplifiedCalculatedFilterField = Omit<
  FieldCommonProperties,
  'freeze' | 'index' | 'unique'
> & {
  array: true;
  calculatedType: 'embeddedFields' | 'filterFields';
  configName: string;
  asyncFunc?: (
    args: Record<string, any>,
    resolverCreatorArg: ResolverCreatorArg,
    resolverArg: ResolverArg,
  ) => Promise<any>;
  fieldsToUseNames?: string[];
  inputTypes?: Record<string, string>;
  func: (
    args: Record<string, any>,
    data: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
    index?: number,
  ) => GraphqlObject[];
};
export type ScalarSimplifiedCalculatedGeospatialField = Omit<
  FieldCommonProperties,
  'freeze' | 'index' | 'unique'
> & {
  array?: false;
  nullable?: false;
  calculatedType: 'geospatialFields';
  geospatialType: 'Point' | 'Polygon' | 'MultiPolygon';
  asyncFunc?: (
    args: Record<string, any>,
    resolverCreatorArg: ResolverCreatorArg,
    resolverArg: ResolverArg,
  ) => Promise<any>;
  fieldsToUseNames?: string[];
  inputTypes?: Record<string, string>;
  func: (
    args: Record<string, any>,
    data: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
    index?: number,
  ) => null | GeospatialPoint | GeospatialPolygon | GeospatialMultiPolygon;
};
export type ArraySimplifiedCalculatedGeospatialField = Omit<
  FieldCommonProperties,
  'freeze' | 'index' | 'unique'
> & {
  array: true;
  nullable?: boolean;
  calculatedType: 'geospatialFields';
  geospatialType: 'Point' | 'Polygon' | 'MultiPolygon';
  asyncFunc?: (
    args: Record<string, any>,
    resolverCreatorArg: ResolverCreatorArg,
    resolverArg: ResolverArg,
  ) => Promise<any>;
  fieldsToUseNames?: string[];
  inputTypes?: Record<string, string>;
  func: (
    args: Record<string, any>,
    data: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
    index?: number,
  ) => GeospatialPoint[] | GeospatialPolygon[] | GeospatialMultiPolygon[];
};
export type ScalarSimplifiedCalculatedField = Omit<
  FieldCommonProperties,
  'freeze' | 'index' | 'unique'
> & {
  array?: false;
  nullable?: false;
  calculatedType: 'booleanFields' | 'dateTimeFields' | 'intFields' | 'floatFields' | 'textFields';
  asyncFunc?: (
    args: Record<string, any>,
    resolverCreatorArg: ResolverCreatorArg,
    resolverArg: ResolverArg,
  ) => Promise<any>;
  fieldsToUseNames?: string[];
  inputTypes?: Record<string, string>;
  func: (
    args: Record<string, any>,
    data: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
    index?: number,
  ) => GraphqlScalar;
};
export type ArraySimplifiedCalculatedField = Omit<
  FieldCommonProperties,
  'freeze' | 'index' | 'unique'
> & {
  array: true;
  nullable?: boolean;
  calculatedType: 'booleanFields' | 'dateTimeFields' | 'intFields' | 'floatFields' | 'textFields';
  asyncFunc?: (
    args: Record<string, any>,
    resolverCreatorArg: ResolverCreatorArg,
    resolverArg: ResolverArg,
  ) => Promise<any>;
  fieldsToUseNames?: string[];
  inputTypes?: Record<string, string>;
  func: (
    args: Record<string, any>,
    data: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
    index?: number,
  ) => GraphqlScalar[];
};
type SimplifiedCalculatedField =
  | ArraySimplifiedCalculatedEmbeddedField
  | ScalarSimplifiedCalculatedEmbeddedField
  | ArraySimplifiedCalculatedFilterField
  | ScalarSimplifiedCalculatedFilterField
  | ArraySimplifiedCalculatedEnumField
  | ScalarSimplifiedCalculatedEnumField
  | ArraySimplifiedCalculatedGeospatialField
  | ScalarSimplifiedCalculatedGeospatialField
  | ArraySimplifiedCalculatedField
  | ScalarSimplifiedCalculatedField;

type SimplifiedEntityConfigCommonProperties = {
  name: string;
  interfaces?: string[];
  descendantNameSlicePosition?: number;
  duplexFields?: SimplifiedDuplexField[];
  embeddedFields?: SimplifiedEmbeddedField[];
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
  uniqueCompoundIndexes?: string[][];
  allowedCalculatedWithAsyncFuncFieldNames?: string[];
  subscriptionActorConfigName?: string;
};

export type SimplifiedEmbeddedEntityConfig = Omit<
  SimplifiedEntityConfigCommonProperties,
  'relationalFields' | 'duplexFields' | 'filterFields'
> & {
  type: 'embedded';
};

export type SimplifiedVirtualEntityConfig = SimplifiedEntityConfigCommonProperties & {
  type: 'virtual';
  childFields?: SimplifiedChildField[];
};

export type SimplifiedEntityConfig =
  | SimplifiedTangibleEntityConfig
  | SimplifiedEmbeddedEntityConfig
  | SimplifiedVirtualEntityConfig;

type ScalarEmbeddedField = Omit<FieldCommonProperties, 'unique'> & {
  array?: false;
  nullable?: false;
  config: EmbeddedEntityConfig;
  type: 'embeddedFields';
};
type ArrayEmbeddedField = Omit<FieldCommonProperties, 'unique'> & {
  array: true;
  nullable?: boolean;
  config: EmbeddedEntityConfig;
  type: 'embeddedFields';
  variants: Array<'plain' | 'connection' | 'count'>;
};
export type EmbeddedField = ArrayEmbeddedField | ScalarEmbeddedField;

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
  variants: Array<'plain' | 'stringified'>;
};
type ArrayFilterField = Omit<FieldCommonProperties, 'index' | 'unique'> & {
  array: true;
  config: TangibleEntityConfig;
  type: 'filterFields';
  variants: Array<'plain' | 'stringified'>;
};
export type FilterField = ArrayFilterField | ScalarFilterField;

type ScalarChildField = Omit<FieldCommonProperties, 'freeze' | 'index' | 'unique'> & {
  array?: false;
  nullable?: false;
  config: VirtualEntityConfig | TangibleEntityConfig;
  type: 'childFields';
};
type ArrayChildField = Omit<FieldCommonProperties, 'freeze' | 'index' | 'unique'> & {
  array: true;
  nullable?: boolean;
  config: VirtualEntityConfig | TangibleEntityConfig;
  type: 'childFields';
};
type ChildField = ArrayChildField | ScalarChildField;

type ScalarCalculatedEnumField = Omit<FieldCommonProperties, 'freeze' | 'index' | 'unique'> & {
  array?: false;
  nullable?: false;
  calculatedType: 'enumFields';
  enumName: string;
  asyncFunc?: (
    args: Record<string, any>,
    resolverCreatorArg: ResolverCreatorArg,
    resolverArg: ResolverArg,
  ) => Promise<any>;
  fieldsToUseNames?: string[];
  inputTypes?: Record<string, string>;
  func: (
    args: Record<string, any>,
    data: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
    index?: number,
  ) => null | string;
  type: 'calculatedFields';
};
type ArrayCalculatedEnumField = Omit<FieldCommonProperties, 'freeze' | 'index' | 'unique'> & {
  array: true;
  nullable?: boolean;
  calculatedType: 'enumFields';
  enumName: string;
  asyncFunc?: (
    args: Record<string, any>,
    resolverCreatorArg: ResolverCreatorArg,
    resolverArg: ResolverArg,
  ) => Promise<any>;
  fieldsToUseNames?: string[];
  inputTypes?: Record<string, string>;
  func: (
    args: Record<string, any>,
    data: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
    index?: number,
  ) => string[];
  type: 'calculatedFields';
};
type ScalarCalculatedEmbeddedField = Omit<FieldCommonProperties, 'freeze' | 'index' | 'unique'> & {
  array?: false;
  nullable?: false;
  calculatedType: 'embeddedFields';
  config: EmbeddedEntityConfig;
  asyncFunc?: (
    args: Record<string, any>,
    resolverCreatorArg: ResolverCreatorArg,
    resolverArg: ResolverArg,
  ) => Promise<any>;
  fieldsToUseNames?: string[];
  inputTypes?: Record<string, string>;
  func: (
    args: Record<string, any>,
    data: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
    index?: number,
  ) => GraphqlObject;
  type: 'calculatedFields';
};
type ArrayCalculatedEmbeddedField = Omit<FieldCommonProperties, 'freeze' | 'index' | 'unique'> & {
  array: true;
  nullable?: boolean;
  calculatedType: 'embeddedFields';
  config: EmbeddedEntityConfig;
  asyncFunc?: (
    args: Record<string, any>,
    resolverCreatorArg: ResolverCreatorArg,
    resolverArg: ResolverArg,
  ) => Promise<any>;
  fieldsToUseNames?: string[];
  inputTypes?: Record<string, string>;
  func: (
    args: Record<string, any>,
    data: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
    index?: number,
  ) => GraphqlObject[];
  type: 'calculatedFields';
};
type ScalarCalculatedGeospatialField = Omit<
  FieldCommonProperties,
  'freeze' | 'index' | 'unique'
> & {
  array?: false;
  nullable?: false;
  calculatedType: 'geospatialFields';
  geospatialType: 'Point' | 'Polygon' | 'MultiPolygon';
  asyncFunc?: (
    args: Record<string, any>,
    resolverCreatorArg: ResolverCreatorArg,
    resolverArg: ResolverArg,
  ) => Promise<any>;
  fieldsToUseNames?: string[];
  inputTypes?: Record<string, string>;
  func: (
    args: Record<string, any>,
    data: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
    index?: number,
  ) => null | GeospatialPoint | GeospatialPolygon | GeospatialMultiPolygon;
  type: 'calculatedFields';
};
type ArrayCalculatedGeospatialField = Omit<FieldCommonProperties, 'freeze' | 'index' | 'unique'> & {
  array: true;
  nullable?: boolean;
  calculatedType: 'geospatialFields';
  geospatialType: 'Point' | 'Polygon' | 'MultiPolygon';
  asyncFunc?: (
    args: Record<string, any>,
    resolverCreatorArg: ResolverCreatorArg,
    resolverArg: ResolverArg,
  ) => Promise<any>;
  fieldsToUseNames?: string[];
  inputTypes?: Record<string, string>;
  func: (
    args: Record<string, any>,
    data: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
    index?: number,
  ) => GeospatialPoint[] | GeospatialPolygon[] | GeospatialMultiPolygon[];
  type: 'calculatedFields';
};
export type ScalarCalculatedFilterField = Omit<
  FieldCommonProperties,
  'freeze' | 'index' | 'unique'
> & {
  array?: false;
  calculatedType: 'filterFields';
  config: TangibleEntityConfig;
  asyncFunc?: (
    args: Record<string, any>,
    resolverCreatorArg: ResolverCreatorArg,
    resolverArg: ResolverArg,
  ) => Promise<any>;
  fieldsToUseNames?: string[];
  inputTypes?: Record<string, string>;
  func: (
    args: Record<string, any>,
    data: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
    index?: number,
  ) => GraphqlObject;
  type: 'calculatedFields';
};
export type ArrayCalculatedFilterField = Omit<
  FieldCommonProperties,
  'freeze' | 'index' | 'unique'
> & {
  array: true;
  calculatedType: 'filterFields';
  config: TangibleEntityConfig;
  asyncFunc?: (
    args: Record<string, any>,
    resolverCreatorArg: ResolverCreatorArg,
    resolverArg: ResolverArg,
  ) => Promise<any>;
  fieldsToUseNames?: string[];
  inputTypes?: Record<string, string>;
  func: (
    args: Record<string, any>,
    data: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
    index?: number,
  ) => GraphqlObject[];
  type: 'calculatedFields';
};
type ScalarCalculatedField = Omit<FieldCommonProperties, 'freeze' | 'index' | 'unique'> & {
  array?: false;
  nullable?: false;
  calculatedType: 'booleanFields' | 'dateTimeFields' | 'intFields' | 'floatFields' | 'textFields';
  asyncFunc?: (
    args: Record<string, any>,
    resolverCreatorArg: ResolverCreatorArg,
    resolverArg: ResolverArg,
  ) => Promise<any>;
  fieldsToUseNames?: string[];
  inputTypes?: Record<string, string>;
  func: (
    args: Record<string, any>,
    data: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
    index?: number,
  ) => GraphqlScalar;
  type: 'calculatedFields';
};
type ArrayCalculatedField = Omit<FieldCommonProperties, 'freeze' | 'index' | 'unique'> & {
  array: true;
  nullable?: boolean;
  calculatedType: 'booleanFields' | 'dateTimeFields' | 'intFields' | 'floatFields' | 'textFields';
  asyncFunc?: (
    args: Record<string, any>,
    resolverCreatorArg: ResolverCreatorArg,
    resolverArg: ResolverArg,
  ) => Promise<any>;
  fieldsToUseNames?: string[];
  inputTypes?: Record<string, string>;
  func: (
    args: Record<string, any>,
    data: Record<string, GraphqlScalar | GraphqlObject>,
    resolverArg?: ResolverArg,
    asyncFuncResult?: any,
    index?: number,
  ) => GraphqlScalar;
  type: 'calculatedFields';
};
export type CalculatedField =
  | ArrayCalculatedEnumField
  | ScalarCalculatedEnumField
  | ArrayCalculatedEmbeddedField
  | ScalarCalculatedEmbeddedField
  | ArrayCalculatedGeospatialField
  | ScalarCalculatedGeospatialField
  | ArrayCalculatedGeospatialField
  | ScalarCalculatedGeospatialField
  | ArrayCalculatedFilterField
  | ScalarCalculatedFilterField
  | ArrayCalculatedField
  | ScalarCalculatedField;

type EntityConfigCommonProperties = {
  name: string;
  interfaces?: string[];
  descendantNameSlicePosition?: number;
  duplexFields?: DuplexField[];
  embeddedFields?: EmbeddedField[];
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
  uniqueCompoundIndexes?: string[][];
  // used for subscription
  allowedCalculatedWithAsyncFuncFieldNames?: string[];
  subscriptionActorConfig?: VirtualEntityConfig;
};
export type EmbeddedEntityConfig = Omit<
  EntityConfigCommonProperties,
  'relationalFields' | 'duplexFields' | 'filterFields' | 'calculatedFields'
> & {
  type: 'embedded';
};
export type VirtualEntityConfig = EntityConfigCommonProperties & {
  type: 'virtual';
  childFields?: ChildField[];
};

export type EntityConfig = TangibleEntityConfig | EmbeddedEntityConfig | VirtualEntityConfig;

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
  Subscription: {
    [subscriptionName: string]: Array<string>;
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
        // 'subscriptionName' may be: 'createdEntity', 'updatedEntity', 'deletedEntity', 'updateManyEntities', 'updateEntity', 'deleteEntity', ...

        [subscriptionName: string]: entityNamesList;
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
  //
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
  | 'pushIntoEntity'
  | 'updateFilteredEntities'
  | 'updateFilteredEntitiesReturnScalar'
  | 'updateManyEntities'
  | 'updateEntity'
  //
  | 'createdEntity'
  | 'deletedEntity'
  | 'updatedEntity';

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

export type ManualyUsedEntity = { name: string; descendantKey?: string };

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
  manualyUsedEntities?: ManualyUsedEntity[];
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
  Subscription?: {
    [customSubscriptionName: string]: ActionSignatureMethods;
  };
};

type OneSegmentInventoryChain = ['Query'] | ['Mutation'] | ['Subscription'];
export type TwoSegmentInventoryChain =
  | [
      'Query', // "string" for 'entity', 'childEntity', 'childEntityGetOrCreate', 'entities', 'childEntities', 'childEntitiesThroughConnection', 'entitiesByUnique', 'entitiesThroughConnection', 'entityDistinctValues' or custom query
      string,
    ]
  | [
      'Mutation', // "string" for 'copyEntity', 'copyManyEntities', 'copyEntityWithChildren', 'copyManyEntitiesWithChildren', 'createEntity', 'createManyEntities',
      // ... 'updateFilteredEntities', 'updateManyEntities', 'updateEntity', 'deleteFilteredEntities', 'deleteManyEntities', ...
      // ... 'deleteEntity', 'deleteEntityWithChildren', 'pushIntoEntity' or custom mutation
      string,
    ]
  | [
      'Subscription', //  'createdEntity', 'updatedEntity', 'deletedEntity'
      string,
    ];

export type ThreeSegmentInventoryChain =
  | [
      'Query', // first "string" for 'entity', 'childEntity', 'childEntityGetOrCreate', 'entities', 'childEntities', 'childEntitiesThroughConnection', 'entitiesByUnique', 'entitiesThroughConnection', 'entityDistinctValues' or custom query, second for entity name
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
  | [
      'Subscription', // "string" for 'createdEntity', 'updatedEntity', 'deletedEntity'
      string,
      string,
    ];

export type InventoryChain =
  | OneSegmentInventoryChain
  | TwoSegmentInventoryChain
  | ThreeSegmentInventoryChain;

export type InventoryByRoles = {
  // must be setted for all roles
  [role: string]: Inventory;
};

export type DataObject = {
  [key: string]: any;
};

type Merge<A, B> = { [K in keyof A]: K extends keyof B ? B[K] : A[K] } & B;

export type InvolvedFilter = Merge<
  { [key: string]: GraphqlScalar | InvolvedFilter | InvolvedFilter[] },
  { AND?: InvolvedFilter[]; OR?: InvolvedFilter[]; XOR?: InvolvedFilter[] }
>;

export type UserAttributes = Merge<DataObject, { roles: string[] }>;

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

export type SubscriptionInvolvedEntityNames =
  | 'subscriptionCreatedEntityName'
  | 'subscriptionDeletedEntityName'
  | 'subscriptionUpdatedEntityName';

export type ActionResolver = (
  parent: null | GraphqlObject,
  args: GraphqlObject,
  context: Context,
  info: SintheticResolverInfo,
  resolverOptions: {
    involvedFilters: {
      [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
    };
    subscriptionEntityNames?: Record<SubscriptionInvolvedEntityNames, string>;
    subscribePayloadMongoFilter?: Record<string, any>; // used in Subscription
    subscriptionUpdatedFields?: string[]; // used in Subscription
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
  subscribePayloadFilters?: EntityFilters; // "subscribePayloadFilter" can used only with help of "getUserAttributes",
  staticFilters?: {
    [tangibleEntityName: string]: InvolvedFilter;
  };
  personalFilters?: {
    // entity points to a tuple of 3 strings:
    // "user entity name", "field of user entity that point to Filter entity", "name of filter field of Filer entity" ]
    [tangibleEntityName: string]: [string, string, string];
  };
  // can used only if "personalFilters" is defined
  skipPersonalFilter?: (entityName: string, userAttributes: Record<string, any>) => boolean;

  staticLimits?: {
    [tangibleEntityName: string]: number;
  };
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

export type Subscription = {
  subscribe: (
    parent: null | GraphqlObject,
    args: { where?: GraphqlObject },
    context: Context,
    info: SintheticResolverInfo,
    involvedFilters: {
      [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
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

export type ActionInvolvedEntityNames = {
  inputOutputEntity?: string;
  inputEntity?: string;
  outputEntity?: string;
  subscriptionCreatedEntity?: string;
  subscriptionDeletedEntity?: string;
  subscriptionUpdatedEntity?: string;
};

export type ActionAttributes = {
  actionArgsToHide?: string[]; // some of argNames to hide in schema action signature
  actionGeneralName: (descendantKey?: string) => string;
  actionType: 'Mutation' | 'Query' | 'Subscription' | 'Field';
  actionAllowed: (entityConfig: EntityConfig) => boolean;
  actionIsChild?: 'Array' | 'Scalar';
  actionName: (baseName: string, descendantKey?: string) => string;
  inputCreators: Array<InputCreator>;
  argNames: Array<string>;
  argTypes: Array<(entityConfig: EntityConfig) => string>;
  actionInvolvedEntityNames: (name: string, descendantKey?: string) => ActionInvolvedEntityNames;
  actionReturnString: (entityConfig: EntityConfig, descendantKey: string) => string;
  actionReturnConfig: (
    entityConfig: EntityConfig,
    generalConfig: GeneralConfig,
    descendantKey?: string,
  ) => EntityConfig | null;
  actionDescendantUpdater?: (entityConfig: EntityConfig, item: DescendantAttributes) => void;
};

export type GqlActionData = {
  actionType: 'Query' | 'Mutation';
  actionName: string;
  descendantKey?: string;
  entityName: string;
  composeOptions: (arg: GraphqlObject) => GraphqlObject;
};

export type ResolverCreatorArg = {
  entityConfig: EntityConfig;
  generalConfig: GeneralConfig;
  serversideConfig: ServersideConfig;
  inAnyCase?: boolean;
};

export type ResolverArg = {
  parent: null | GraphqlObject;
  args: GraphqlObject;
  context: Context;
  info: SintheticResolverInfo;
  resolverOptions: {
    involvedFilters: {
      [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
    };
    subscriptionEntityNames?: Record<SubscriptionInvolvedEntityNames, string>;
    subscribePayloadMongoFilter?: Record<string, any>; // used in Subscription
    subscriptionUpdatedFields?: string[]; // used in Subscription
  };
};
