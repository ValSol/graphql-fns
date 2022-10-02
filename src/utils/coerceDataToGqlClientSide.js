// @flow

import type { ThingConfig } from '../flowTypes';

import coerceDataToGqlBasic from './coerceDataToGqlBasic';

const ObjectId = null;

const coerceDataToGqlClientSide = (
  data: Object,
  prevData: null | Object,
  thingConfig: ThingConfig,
  allFields?: boolean,
  skipUnusedFields?: boolean, // use when import data from sourse with extra fields
  setNullForEmptyText?: boolean, // when create data to prevent creation text fields with "" value
): Object =>
  coerceDataToGqlBasic(
    ObjectId,
    data,
    prevData,
    thingConfig,
    allFields,
    skipUnusedFields,
    setNullForEmptyText,
  );

export default coerceDataToGqlClientSide;
