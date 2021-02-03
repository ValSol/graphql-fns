// @flow

import type { LookupMongodb, ThingConfig } from '../flowTypes';

import addFilter from './addFilter';
import composeWhereInput from './composeWhereInput';

const mergeWhereAndFilter = (
  filter: Object,
  where: Object,
  thingConfig: ThingConfig,
): { where: Object, lookups: Array<LookupMongodb> } =>
  composeWhereInput(addFilter(filter, where), thingConfig);

export default mergeWhereAndFilter;
