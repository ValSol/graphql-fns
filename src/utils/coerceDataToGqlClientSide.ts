import type {EntityConfig} from '../tsTypes';

import coerceDataToGqlBasic from './coerceDataToGqlBasic';

const ObjectId = null;

const coerceDataToGqlClientSide = (
  data: any,
  prevData: null | any,
  entityConfig: EntityConfig,
  allFields?: boolean,
  // use when import data from sourse with extra fields
  skipUnusedFields?: boolean,
  // when create data to prevent creation text fields with "" value
  setNullForEmptyText?: boolean,
): any => coerceDataToGqlBasic(
  ObjectId,
  data,
  prevData,
  entityConfig,
  allFields,
  skipUnusedFields,
  setNullForEmptyText,
);

export default coerceDataToGqlClientSide;
