// @flow
import { Types } from 'mongoose';

import type { EntityConfig } from '../flowTypes';

import coerceDataToGqlBasic from './coerceDataToGqlBasic';

const { ObjectId } = Types;

const coerceDataToGqlServerSide = (
  data: Object,
  prevData: null | Object,
  entityConfig: EntityConfig,
  allFields?: boolean,
  skipUnusedFields?: boolean, // use when import data from sourse with extra fields
  setNullForEmptyText?: boolean, // when create data to prevent creation text fields with "" value
): Object =>
  coerceDataToGqlBasic(
    ObjectId,
    data,
    prevData,
    entityConfig,
    allFields,
    skipUnusedFields,
    setNullForEmptyText,
  );

export default coerceDataToGqlServerSide;
