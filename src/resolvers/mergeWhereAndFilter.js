// @flow

import type { LookupMongodb, ThingConfig } from '../flowTypes';

import addFilter from './addFilter';
import composeWhereInput from './composeWhereInput';

const mergeWhereAndFilter = (
  filter: Array<Object>,
  where: Object,
  thingConfig: ThingConfig,
  notCreateObjectId?: boolean,
): { where: Object, lookups: Array<LookupMongodb> } =>
  composeWhereInput(addFilter(filter, where), thingConfig, notCreateObjectId);

export default mergeWhereAndFilter;
