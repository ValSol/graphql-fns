// @flow

import type { ThingConfig } from '../flowTypes';

import addFilter from './addFilter';
import composeWhereInput from './composeWhereInput';

const mergeWhereAndFilter = (
  filter: Object,
  where: Object,
  thingConfig: ThingConfig,
): null | Object => composeWhereInput(addFilter(filter, where), thingConfig);

export default mergeWhereAndFilter;
